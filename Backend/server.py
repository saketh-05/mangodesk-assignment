from __future__ import print_function
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import uvicorn
import google.generativeai as genai

from typing import List
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
import time
from pprint import pprint

# Load environment variables
load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

# Instantiate the client
configuration = sib_api_v3_sdk.Configuration()
configuration.api_key['api-key'] = os.getenv("BREVO_API_KEY")
api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))


sender_email = os.getenv("EMAIL_ADDRESS") or "test@gmail.com"

# Since this is sample task I am allowing all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextPrompt(BaseModel):
    text: str
    prompt: str

class EmailSummary(BaseModel):
    emails: list[str]
    summary: str

# Generate Summary Endpoint
@app.post("/api/generate/summary")
async def generate_response(request: TextPrompt):
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Combine text and prompt
        full_prompt = f"""
        You are an expert at summarizing text which can be any text transcript like meeting notes, call transcript, etc. 
        Your job is to Summarize the Text Transcript according to following instructions provided if any. You must follow the instructions if they are provided for summarizing the Text Transcript.
        If no meaningful text transcript is provided, just say "Please provide meaningful text transcript/instructions." only.
        Additional Instructions: {request.prompt}\n\nText Transcript: {request.text}
        """
        
        response = model.generate_content(full_prompt)
        # print(response)
        return {"response": response.text}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# Endpoint to share generated summary via email
@app.post("/api/share/summary")
async def share_summary(request: EmailSummary):
    try:
        # Implemented the logic to share the summary via email
        print(f"Sharing summary {request.summary} with:", request.emails)
        subject = "Summary from AI"
        body = f"<p>Here is the summary shared with you:</p><p>{request.summary}</p>"
        
        # Make the call to the client
        try:
            # Define the campaign settings
            send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                to=[{"email": email, "name": "Receiver"} for email in request.emails],
                sender={"email": sender_email, "name": "You"},
                subject=subject,
                html_content=body
            )

            api_response = api_instance.send_transac_email(send_smtp_email)
            pprint(api_response)
        except ApiException as e:
            print("❌ Error:", e)
            return {"message": "Error sending emails", "error": str(e)}
            
        print("Emails sent successfully to:", request.emails)
        return {"message": "Summary shared successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Health Check Endpoint
@app.get("/api")
async def root():
    return {"message": "Gemini API Server is running"}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)