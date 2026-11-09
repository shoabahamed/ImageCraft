from flask import jsonify, request, g
from email_validator import validate_email, EmailNotValidError
from utils.token_utils import create_token
from config.db_config import get_db
import datetime
from bson import ObjectId
import os
from utils.common import get_user_paths, create_user_paths
from flask import redirect, request
from pip._vendor import cachecontrol
from dotenv import load_dotenv
import stripe

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
FRONTEND_SERVER = os.getenv("FRONTEND_SERVER", "http://localhost:5000")

PRO_PRICE_ID = "price_1UZoliRC76RF6jPtUv9SuCZb"
ULTIMATE_PRICE_ID = "price_1UZom9RC76RF6jPt52IWV5M3"

# May be I should have added a password too for creating jwt token

db = get_db()
users_collection = db["Users"]



def subscribe_user():
  plan = request.args.get('plan') 
  user_id = g._id
  
  if(plan == 'pro'):
    price_id = PRO_PRICE_ID
  elif(plan == 'ultimate'):
    price_id = ULTIMATE_PRICE_ID
  else:
    return jsonify({"success": False, "message": "Invalid plan"}), 400
  
  try:
    
    
    # here first check if a subscription alrady exist of not if exist modify that otherwise create new one
    
    
    user = users_collection.find_one({"_id": ObjectId(user_id)}, {})
    if(user.get("subscription_id")):
      subscription_id = user.get("subscription_id")
      subscription = stripe.Subscription.retrieve(subscription_id, expand=['items'])
      stripe.Subscription.modify(
        subscription_id,
        cancel_at_period_end=user.get("cancel_at_period_end", False),
        items=[{
            'id': subscription['items']['data'][0].id,
            'price': price_id,  # replace with your ultimate plan price ID
        }]
      )
      return jsonify({"success": True, "url": FRONTEND_SERVER}), 200
    else:
      session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        mode="subscription",
        line_items=[
          {
            "price": price_id,
            "quantity": 1,
          }
        ],

        subscription_data={
          "metadata": {
              "user_id": user_id,
              "plan": plan
          }
      },
        # success_url=f"{FRONTEND_SERVER}/success?session_id={{CHECKOUT_SESSION_ID}}",
        success_url=f"{FRONTEND_SERVER}",
        cancel_url=f"{FRONTEND_SERVER}/error"
      )
      
      return jsonify({"success": True, "url": session.url}), 200
  except Exception as e:
    return jsonify({"success": False, "message": str(e)}), 500





def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    event = None
    SUBSCRIPTION_DAYS = int(os.getenv('SUBSCRIPTION_DAYS', '30'))

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        # Invalid payload
        print('Invalid payload')
        return '', 400
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        print('Invalid signature')
        return '', 400

    print("before event handling")
    # Handle the event
    if event['type'] == 'invoice.payment_succeeded':
      # here we need to save status(subscription status) and cancel_at_period_end
        invoice = event['data']['object']
      
        subscription_id = invoice.get("subscription") or invoice.get("parent", {}).get("subscription_details", {}).get("subscription")
        
        # Get the subscription to retrieve metadata
        subscription = stripe.Subscription.retrieve(subscription_id)
        customer_id = subscription.get('customer')
        metadata = subscription.get('metadata', {})

        user_id = metadata.get('user_id')
        plan = metadata.get('plan')
        if user_id and plan:
            now = datetime.datetime.utcnow()
            subscription_start = now
            subscription_end = now + datetime.timedelta(days=SUBSCRIPTION_DAYS)

            users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {
                    "subscription_plan": plan,
                    "subscription_start": subscription_start,
                    "subscription_end": subscription_end,
                    "style_completion": 0,
                    "upscale_completion": 0,
                    "subscription_id": subscription_id,
                    "customer_id": customer_id,
                    "subscription_status": "active",
                    "cancel_at_period_end": False
                }}
            )
            print(f"Updated user {user_id} with plan {plan} from {subscription_start} to {subscription_end}")

    elif event['type'] == "customer.subscription.updated":
        subscription = event['data']['object']
        subscription_id = subscription['id']

        # Which price is the subscription on right now?
        price_id = subscription['items']['data'][0]['price']['id']
        if price_id == PRO_PRICE_ID:
            plan = "pro"
        elif price_id == ULTIMATE_PRICE_ID:
            plan = "ultimate"
        else:
            plan = None

        # Did the user schedule a cancellation?
        is_canceling = bool(subscription.get('cancel_at_period_end')) or subscription.get('cancel_at') is not None

        update = {
            "subscription_status": subscription['status'],
            "cancel_at_period_end": is_canceling,
        }
        if plan:
            update["subscription_plan"] = plan

        users_collection.update_one(
            {"subscription_id": subscription_id},
            {"$set": update}
        )
        print(f"Subscription {subscription_id} updated. Canceling: {is_canceling}")

    elif event['type'] == "customer.subscription.updated":
        
        subscription = event['data']['object']
        subscription_id = subscription['id']

        # Which price is the subscription on right now?
        price_id = subscription['items']['data'][0]['price']['id']
        if price_id == PRO_PRICE_ID:
            plan = "pro"
        elif price_id == ULTIMATE_PRICE_ID:
            plan = "ultimate"
        else:
            plan = None

        # Did the user schedule a cancellation?
        is_canceling = bool(subscription.get('cancel_at_period_end')) or subscription.get('cancel_at') is not None

        update = {
            "subscription_status": subscription['status'],
            "cancel_at_period_end": is_canceling,
        }
        if plan:
            update["subscription_plan"] = plan

        users_collection.update_one(
            {"subscription_id": subscription_id},
            {"$set": update}
        )
        print(f"Subscription {subscription_id} updated. Canceling: {is_canceling}")
        
    else:
        print(f'Unhandled event type {event["type"]}')

    return '', 200
  








def get_user_subscription_info():
  try:
    requester_id = g._id
    
    user = users_collection.find_one({"_id": ObjectId(requester_id)}, { "_id": 1, "subscription_plan": 1, "subscription_end": 1, "style_completion": 1, "upscale_completion": 1})
    


    if(str(user['_id']) == requester_id):
      user['_id'] = requester_id
      return jsonify({"success": True, "message": "Data Retrieveal successful", "data": user}), 200
    else:
      return jsonify({"success": True, "message": "You do not have creditial"}), 400
    
  except Exception as e: 
    return jsonify({"success": False, "message": str(e)}), 200








def subscription_manage():
    try:
        user_id = g._id
        user = users_collection.find_one({"_id": ObjectId(user_id)}, {"customer_id": 1})
        if not user or not user.get("customer_id"):
            return jsonify({"success": False, "message": "No customer_id found for user."}), 400
        print(user)
        customer_id = user["customer_id"]
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=FRONTEND_SERVER
        )
     
        return jsonify({"success": True, "url": session.url}), 200
    except Exception as e: 
        return jsonify({"success": False, "message": str(e)}), 500