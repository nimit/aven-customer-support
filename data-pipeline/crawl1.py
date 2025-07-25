import os
from dotenv import load_dotenv
from exa_py import Exa
import json

load_dotenv()

exa = Exa(api_key = os.environ['EXA_API_KEY'])

result = exa.get_contents(
  ["https://www.aven.com/support"],
  text = {
    "max_characters": 500
  },
  summary = {
    "query": "List all the question/answers on this FAQ page in as much detail as possible without repeating yourself.\nMake sure you are not hallucinating and strictly retain facts from the page.\nFor each question-answer pair, generate a list of keywords and tags that are related to or appear in the content",
    "schema": {
      "description": "Schema describing a list of question-answer objects with associated tags",
      "type": "object",
      "required": ["items"],
      "additional_properties": False,
      "properties": {
        "items": {
          "type": "array",
          "description": "List of question-answer objects",
          "items": {
            "type": "object",
            "required": ["question", "answer", "tags"],
            "additional_properties": False,
            "properties": {
              "question": {
                "type": "string",
                "description": "The question text"
              },
              "answer": {
                "type": "string",
                "description": "The answer to the question"
              },
              "tags": {
                "type": "array",
                "description": "Keywords or tags associated with this Q&A pair"
              }
            }
          }
        }
      }
    }
  }
)

with open('crawl1.json', 'w') as fp:
  json.dump(result, fp, default=lambda x: str(x))