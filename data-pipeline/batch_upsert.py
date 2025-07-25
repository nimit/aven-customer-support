import os
import json
from dotenv import load_dotenv
from pinecone import Pinecone
import uuid

load_dotenv()

pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
index = pc.Index(host=os.environ["PINECONE_INDEX_HOST"])

with open("scrape.json") as fp:
    faqs = json.load(fp)["items"]

records = [
    {
        "id": f"faq#{i}",
        "text": data["answer"],
        "source": "official support",
        "url": "",
        "date": "2025-07-25",
        "tags": data["tags"],
    }
    for i, data in enumerate(faqs)
]

index.upsert_records("__default__", records)
print(f"Successfully upserted {len(records)} records.")

with open("exa-research.json") as fp:
    research = json.load(fp)["items"]

records2 = [
    {"id": f"{item['source']}#{uuid.uuid4()}", "text": text, **item}
    for item in research
    for text in item.pop("contents")
]

index.upsert_records("__default__", records2)
print(f"Successfully upserted {len(records2)} records.")
