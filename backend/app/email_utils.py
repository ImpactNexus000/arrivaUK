import smtplib
import random
import os
import threading
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))


def generate_otp() -> str:
    return str(random.randint(100000, 999999))


def _send_email(to_email: str, subject: str, plain: str, html: str):
    """Actually send the email via SMTP (runs in a background thread)."""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"ArrivaUK <{SMTP_EMAIL}>"
        msg["To"] = to_email
        msg.attach(MIMEText(plain, "plain"))
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP_SSL(SMTP_HOST, 465, timeout=30) as server:
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, to_email, msg.as_string())
        print(f"[EMAIL] OTP sent to {to_email}")
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send to {to_email}: {e}")


def send_otp_email(to_email: str, otp_code: str, purpose: str = "register"):
    subject = "ArriveUK - Your Verification Code"
    purpose_map = {
        "register": "complete your registration",
        "login": "sign in to your account",
        "reset": "reset your password",
    }
    purpose_text = purpose_map.get(purpose, "verify your identity")

    html = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #f8f9fa;">
      <div style="background: linear-gradient(135deg, #0A2342, #1a4a7a); border-radius: 20px; padding: 40px 32px; text-align: center;">
        <h1 style="color: white; font-size: 28px; margin: 0 0 8px;">ArriveUK</h1>
        <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin: 0;">Your UK Student Companion</p>
      </div>
      <div style="background: white; border-radius: 20px; padding: 36px 32px; margin-top: 16px; text-align: center;">
        <p style="color: #333; font-size: 16px; margin: 0 0 24px;">
          Use this code to {purpose_text}:
        </p>
        <div style="background: #f0f4f8; border-radius: 16px; padding: 20px; margin: 0 0 24px;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0A2342;">{otp_code}</span>
        </div>
        <p style="color: #888; font-size: 13px; margin: 0;">
          This code expires in <strong>15 minutes</strong>.<br>
          If you didn't request this, please ignore this email.
        </p>
      </div>
    </div>
    """

    plain = f"Your ArriveUK verification code is: {otp_code}. It expires in 15 minutes."

    # Send in background thread so it doesn't block the API response
    thread = threading.Thread(target=_send_email, args=(to_email, subject, plain, html), daemon=True)
    thread.start()
