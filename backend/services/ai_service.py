import openai
import re
from textblob import TextBlob
from flask import current_app

class AIService:
    @staticmethod
    def analyze_sentiment(text):
        """Simple sentiment analysis using TextBlob"""
        try:
            analysis = TextBlob(text)
            polarity = analysis.sentiment.polarity
            
            if polarity < -0.3:
                return 'sad'
            elif polarity < 0:
                return 'anxious'
            elif polarity == 0:
                return 'neutral'
            elif polarity < 0.3:
                return 'calm'
            else:
                return 'happy'
        except:
            return 'neutral'

    @staticmethod
    def contains_emergency_keywords(text):
        """Check for self-harm/suicide keywords"""
        emergency_patterns = [
            r'suicide', r'kill myself', r'end it all', r'not want to live',
            r'want to die', r'harm myself', r'cut myself', r'overdose',
            r'खुदकुशी', r'आत्महत्या', r'मरना चाहता', r'जीना नहीं चाहता'
        ]
        text = text.lower()
        return any(re.search(pattern, text) for pattern in emergency_patterns)

    @staticmethod
    def generate_ai_response(user_input):
        """Generate AI response using OpenAI"""
        if AIService.contains_emergency_keywords(user_input):
            emergency_msg = "You're not alone. Please call the Vandrevala Foundation Helpline at 9152987821 or 1860-2662-345. You can also reach out to a close friend or family member. I'm here to listen."
            return emergency_msg, 'emergency'

        try:
            client = openai.OpenAI(api_key=current_app.config['OPENAI_API_KEY'])
            
            system_prompt = """You are MoodMate, a compassionate mental wellness companion. 
            Respond in Hinglish (Hindi-English mix) or English based on the user's language. 
            Be empathetic, supportive, and non-judgmental. Keep responses conversational and warm."""
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input}
                ],
                max_tokens=150,
                temperature=0.7
            )

            ai_response = response.choices[0].message.content
            sentiment = AIService.analyze_sentiment(user_input)
            
            return ai_response, sentiment

        except Exception as e:
            print(f"OpenAI Error: {e}")
            return "I'm here to listen. Could you tell me more about how you're feeling?", 'neutral'