import os
from dotenv import load_dotenv
from firecrawl import JsonConfig, FirecrawlApp
import json
from pydantic import BaseModel, Field


load_dotenv()


class QuestionAnswer(BaseModel):
    question: str = Field(..., description="The question text")
    answer: str = Field(..., description="The answer to the question")
    tags: list[str] = Field(
        ..., description="Keywords or tags associated with this Q&A pair"
    )


class SupportSchema(BaseModel):
    items: list[QuestionAnswer] = Field(
        ..., description="List of question-answer objects"
    )


app = FirecrawlApp(api_key=os.environ["FIRECRAWL_API_KEY"])

result = app.scrape_url(
    "https://www.aven.com/support",
    formats=["json"],
    json_options=JsonConfig(
        schema=SupportSchema,
        prompt="List all the question/answers on this FAQ page in as much detail as possible without repeating yourself. Make sure you are not hallucinating and strictly retain facts from the page. For each question-answer pair, generate a list of keywords and tags that are related to or appear in the content",
    ),
    only_main_content=True,
    timeout=1_200_000,
)


with open("scrape.json", "w") as fp:
    json.dump(result.json, fp)
