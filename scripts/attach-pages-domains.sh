#!/usr/bin/env bash
# Attach dripnex.app and www.dripnex.app to Pages project dripnex-marketing.
#
# Scope is hard-limited to those two hostnames:
#   - Pages custom domains: dripnex.app, www.dripnex.app
#   - DNS writes: apex (@ / dripnex.app) and www only, proxied CNAME
#     to dripnex-marketing.pages.dev
#
# Never create, edit, delete, or point api / api.dripnex.app DNS, Worker
# routes, or custom domains. Leave MX / TXT / SPF / google-site-verification
# alone.
set -euo pipefail

CF_API="https://api.cloudflare.com/client/v4"
ACCOUNT="${CLOUDFLARE_ACCOUNT_ID:-}"
TOKEN="${CLOUDFLARE_API_TOKEN:-}"
PROJECT="dripnex-marketing"
ZONE_NAME="dripnex.app"
CNAME_TARGET="dripnex-marketing.pages.dev"
MANAGED_DOMAINS=(dripnex.app www.dripnex.app)

if [[ -z "$ACCOUNT" || -z "$TOKEN" ]]; then
  echo "CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID must be set" >&2
  exit 1
fi

if ! command -v jq >/dev/null; then
  echo "jq is required" >&2
  exit 1
fi

normalize_name() {
  local n
  n="$(printf '%s' "${1:-}" | tr '[:upper:]' '[:lower:]')"
  n="${n%.}"
  case "$n" in
    ""|"@"|"$ZONE_NAME") printf '%s\n' "$ZONE_NAME" ;;
    *.*) printf '%s\n' "$n" ;;
    *) printf '%s.%s\n' "$n" "$ZONE_NAME" ;;
  esac
}

is_protected_name() {
  [[ "$(normalize_name "$1")" == "api.dripnex.app" ]]
}

is_managed_name() {
  local n
  n="$(normalize_name "$1")"
  [[ "$n" == "dripnex.app" || "$n" == "www.dripnex.app" ]]
}

assert_writable_name() {
  local raw="$1"
  if is_protected_name "$raw"; then
    echo "refusing to modify protected hostname: ${raw}" >&2
    exit 1
  fi
  if ! is_managed_name "$raw"; then
    echo "refusing to modify hostname outside apex/www scope: ${raw}" >&2
    exit 1
  fi
}

cf() {
  local method="$1"
  local path="$2"
  shift 2
  curl -sS -X "$method" "${CF_API}${path}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    "$@"
}

require_success() {
  local body="$1"
  local ctx="$2"
  if [[ "$(printf '%s' "$body" | jq -r '.success // false')" != "true" ]]; then
    echo "Cloudflare API error (${ctx}):" >&2
    printf '%s\n' "$body" | jq . >&2 || printf '%s\n' "$body" >&2
    exit 1
  fi
}

cf_ok() {
  local method="$1"
  local path="$2"
  local ctx="$3"
  shift 3
  local body
  body="$(cf "$method" "$path" "$@")"
  require_success "$body" "$ctx"
  printf '%s\n' "$body"
}

# Concatenate paginated .result arrays. Fails if any page is unsuccessful.
cf_list() {
  local path="$1"
  local ctx="$2"
  local page=1
  local sep='?'
  local all='[]'
  [[ "$path" == *\?* ]] && sep='&'
  while true; do
    local body batch total_pages
    body="$(cf GET "${path}${sep}page=${page}&per_page=50")"
    require_success "$body" "${ctx} (page ${page})"
    batch="$(printf '%s' "$body" | jq '.result // []')"
    all="$(jq -n --argjson a "$all" --argjson b "$batch" '$a + $b')"
    total_pages="$(printf '%s' "$body" | jq -r '.result_info.total_pages // 1')"
    if [[ "$page" -ge "$total_pages" ]]; then
      break
    fi
    page=$((page + 1))
  done
  printf '%s\n' "$all"
}

echo "Detaching dripnex.app / www.dripnex.app from any Pages project other than ${PROJECT}"
projects="$(cf_list "/accounts/${ACCOUNT}/pages/projects" "list Pages projects")"
printf '%s\n' "$projects" | jq -c '{names:[.[].name]}'

while IFS= read -r project; do
  [[ -n "$project" ]] || continue
  domains="$(cf_list "/accounts/${ACCOUNT}/pages/projects/${project}/domains" "list domains for ${project}")"
  printf '%s\n' "$domains" | jq -c --arg p "$project" '{project:$p,domains:[.[].name]}'
  if [[ "$project" == "$PROJECT" ]]; then
    continue
  fi
  while IFS= read -r domain; do
    [[ -n "$domain" ]] || continue
    assert_writable_name "$domain"
    echo "detaching ${domain} from ${project}"
    cf_ok DELETE "/accounts/${ACCOUNT}/pages/projects/${project}/domains/${domain}" \
      "detach ${domain} from ${project}" >/dev/null
  done < <(printf '%s\n' "$domains" | jq -r '.[] | select(.name=="dripnex.app" or .name=="www.dripnex.app") | .name')
done < <(printf '%s\n' "$projects" | jq -r '.[].name')

attach_domain() {
  local host="$1"
  assert_writable_name "$host"
  local resp success
  resp="$(cf POST "/accounts/${ACCOUNT}/pages/projects/${PROJECT}/domains" \
    --data "$(jq -n --arg name "$host" '{name:$name}')")"
  printf '%s\n' "$resp" | jq -c '{name:.result.name,status:.result.status,success,errors}'
  success="$(printf '%s' "$resp" | jq -r '.success // false')"
  if [[ "$success" == "true" ]]; then
    echo "attached ${host} to ${PROJECT}"
    return 0
  fi

  local ours
  ours="$(cf_list "/accounts/${ACCOUNT}/pages/projects/${PROJECT}/domains" "list ${PROJECT} domains")"
  if printf '%s\n' "$ours" | jq -e --arg n "$host" '[.[].name] | index($n) != null' >/dev/null; then
    echo "${host} already attached to ${PROJECT} (ok)"
    return 0
  fi

  echo "failed to attach ${host} to ${PROJECT}" >&2
  printf '%s\n' "$resp" | jq . >&2 || printf '%s\n' "$resp" >&2
  exit 1
}

for host in "${MANAGED_DOMAINS[@]}"; do
  attach_domain "$host"
done

zone_body="$(cf GET "/zones?name=${ZONE_NAME}")"
require_success "$zone_body" "lookup zone ${ZONE_NAME}"
ZONE_ID="$(printf '%s' "$zone_body" | jq -r '.result[0].id // empty')"
if [[ -z "$ZONE_ID" ]]; then
  echo "zone ${ZONE_NAME} not found" >&2
  exit 1
fi
echo "zone=${ZONE_ID}"

dns_records="$(cf_list "/zones/${ZONE_ID}/dns_records" "list DNS records")"
printf '%s\n' "$dns_records" | jq -c '{
  count: length,
  records: [.[] | {id,type,name,content,proxied}]
}'

is_address_record() {
  [[ "$1" == "A" || "$1" == "AAAA" || "$1" == "CNAME" ]]
}

desired_cname() {
  local type="$1"
  local content="$2"
  local proxied="$3"
  local target
  target="$(printf '%s' "$content" | tr '[:upper:]' '[:lower:]')"
  target="${target%.}"
  [[ "$type" == "CNAME" && "$target" == "$CNAME_TARGET" && "$proxied" == "true" ]]
}

ensure_cname() {
  local fqdn="$1"
  assert_writable_name "$fqdn"

  local matches
  matches="$(printf '%s\n' "$dns_records" | jq -c --arg zone "$ZONE_NAME" --arg fqdn "$fqdn" '
    def norm:
      ascii_downcase
      | sub("\\.$"; "")
      | if . == "" or . == "@" or . == $zone then $zone
        elif test("\\.") then .
        else . + "." + $zone
        end;
    [.[] | select((.name | norm) == $fqdn)]
  ')"

  echo "DNS records for ${fqdn}:"
  printf '%s\n' "$matches" | jq -c '[.[] | {id,type,name,content,proxied}]'

  local skipped
  skipped="$(printf '%s\n' "$matches" | jq -r '.[] | select(.type != "A" and .type != "AAAA" and .type != "CNAME") | "leaving \(.type) \(.name) untouched"')"
  if [[ -n "$skipped" ]]; then
    printf '%s\n' "$skipped"
  fi

  local keep=""
  local id type content proxied
  while IFS=$'\t' read -r id type content proxied; do
    [[ -n "$id" ]] || continue
    if desired_cname "$type" "$content" "$proxied"; then
      keep="$id"
      break
    fi
  done < <(printf '%s\n' "$matches" | jq -r '.[] | select(.type=="A" or .type=="AAAA" or .type=="CNAME") | [.id,.type,.content,(.proxied|tostring)] | @tsv')

  delete_conflicting() {
    local preserve="${1:-}"
    local rid rtype rname
    while IFS=$'\t' read -r rid rtype rname; do
      [[ -n "$rid" ]] || continue
      [[ "$rid" != "$preserve" ]] || continue
      assert_writable_name "$rname"
      if ! is_address_record "$rtype"; then
        continue
      fi
      echo "deleting leftover ${rtype} ${rname} ${rid}"
      cf_ok DELETE "/zones/${ZONE_ID}/dns_records/${rid}" \
        "delete ${rtype} ${rname}" >/dev/null
    done < <(printf '%s\n' "$matches" | jq -r '.[] | select(.type=="A" or .type=="AAAA" or .type=="CNAME") | [.id,.type,.name] | @tsv')
  }

  if [[ -n "$keep" ]]; then
    echo "${fqdn} already proxied CNAME -> ${CNAME_TARGET}"
    delete_conflicting "$keep"
    return 0
  fi

  local first=""
  first="$(printf '%s\n' "$matches" | jq -r '[.[] | select(.type=="A" or .type=="AAAA" or .type=="CNAME") | .id] | first // empty')"

  local payload
  payload="$(jq -n --arg name "$fqdn" --arg content "$CNAME_TARGET" \
    '{type:"CNAME",name:$name,content:$content,proxied:true,ttl:1}')"

  if [[ -n "$first" ]]; then
    # Remove sibling A/AAAA/CNAME first; Cloudflare rejects CNAME+A coexistence.
    delete_conflicting "$first"
    echo "updating ${fqdn} ${first} -> proxied CNAME ${CNAME_TARGET}"
    cf_ok PUT "/zones/${ZONE_ID}/dns_records/${first}" \
      "update ${fqdn} to CNAME" \
      --data "$payload" \
      | jq -c '{updated:.result|{name,type,content,proxied}}'
  else
    echo "creating proxied CNAME ${fqdn} -> ${CNAME_TARGET}"
    cf_ok POST "/zones/${ZONE_ID}/dns_records" \
      "create ${fqdn} CNAME" \
      --data "$payload" \
      | jq -c '{created:.result|{name,type,content,proxied}}'
  fi
}

# Refresh after possible mutations on the first hostname.
refresh_dns() {
  dns_records="$(cf_list "/zones/${ZONE_ID}/dns_records" "list DNS records")"
}

for host in "${MANAGED_DOMAINS[@]}"; do
  if is_protected_name "$host"; then
    echo "refusing to modify api DNS" >&2
    exit 1
  fi
  ensure_cname "$host"
  refresh_dns
done

# Re-POST after DNS so Pages can verify; already-on-this-project is success.
for host in "${MANAGED_DOMAINS[@]}"; do
  attach_domain "$host"
done

echo "apex and www are attached to ${PROJECT} (api DNS left untouched)"
