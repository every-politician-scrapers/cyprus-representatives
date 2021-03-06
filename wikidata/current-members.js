const fs = require('fs');
let rawmeta = fs.readFileSync('meta.json');
let meta = JSON.parse(rawmeta);

module.exports = function () {
  return `SELECT ?item ?name ?group ?groupLabel ?district ?districtLabel ?gender ?dob ?dobPrecision
         (STRAFTER(STR(?statement), '/statement/') AS ?psid)
    WHERE
    {
      ?item p:P39 ?statement .
      ?statement ps:P39 wd:${meta.legislature.member} ; pq:P2937 wd:${meta.legislature.term.id} .

      OPTIONAL { ?statement pq:P4100 ?group }
      OPTIONAL { ?statement pq:P768 ?district }
      FILTER NOT EXISTS { ?statement pq:P582 [] }

      OPTIONAL {
        ?statement prov:wasDerivedFrom ?ref .
        ?ref pr:P854 ?source FILTER CONTAINS(STR(?source), '${meta.source.url}')
        OPTIONAL { ?ref pr:P1810 ?sourceName }
        OPTIONAL { ?ref pr:P813 ?sourceDate  }
      }
      OPTIONAL { ?item rdfs:label ?wdLabel FILTER(LANG(?wdLabel) = "${meta.source.lang.code}") }
      BIND(COALESCE(?sourceName, ?wdLabel) AS ?name)

      OPTIONAL { ?item wdt:P21 ?genderItem }
      OPTIONAL { # truthiest DOB, with precison
        ?item p:P569 ?ts .
        ?ts a wikibase:BestRank .
        ?ts psv:P569 [wikibase:timeValue ?dob ; wikibase:timePrecision ?dobPrecision] .
      }

      SERVICE wikibase:label {
        bd:serviceParam wikibase:language "en".
        ?genderItem rdfs:label ?gender .
        ?group rdfs:label ?groupLabel .
        ?district rdfs:label ?districtLabel .
      }
    }
    # ${new Date().toISOString()}
    ORDER BY ?wdLabel ?sourceDate`
}
