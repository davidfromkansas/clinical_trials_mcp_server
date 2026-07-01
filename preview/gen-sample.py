import json, urllib.request

URL = ("https://clinicaltrials.gov/api/v2/studies?query.cond=diabetes"
       "&filter.overallStatus=RECRUITING&pageSize=40&countTotal=true")

with urllib.request.urlopen(URL) as r:
    d = json.load(r)

out = {"query": {"condition": "diabetes", "status": "RECRUITING"},
       "totalCount": d.get("totalCount", 0), "studies": []}

for s in d.get("studies", []):
    p = s["protocolSection"]
    idm = p.get("identificationModule", {})
    locs = []
    for l in p.get("contactsLocationsModule", {}).get("locations", []):
        g = l.get("geoPoint")
        if not g:
            continue
        locs.append({
            "facility": l.get("facility"),
            "city": l.get("city"),
            "state": l.get("state"),
            "country": l.get("country"),
            "status": l.get("status"),
            "lat": g["lat"],
            "lon": g["lon"],
        })
    if not locs:
        continue
    out["studies"].append({
        "nctId": idm.get("nctId"),
        "title": idm.get("briefTitle"),
        "status": p.get("statusModule", {}).get("overallStatus"),
        "phase": ", ".join(p.get("designModule", {}).get("phases", []) or []),
        "sponsor": p.get("sponsorCollaboratorsModule", {}).get("leadSponsor", {}).get("name"),
        "conditions": p.get("conditionsModule", {}).get("conditions", [])[:4],
        "locations": locs,
    })

out["count"] = len(out["studies"])
markers = sum(len(s["locations"]) for s in out["studies"])
with open("preview/sample-data.js", "w") as f:
    f.write("window.__MCP_DATA__ = " + json.dumps(out) + ";")
print("studies with geo:", out["count"], "| markers:", markers, "| totalCount:", out["totalCount"])
