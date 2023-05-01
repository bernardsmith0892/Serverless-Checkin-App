import json
import time
import datetime
import boto3

def lambda_handler(event, context):
    # Get the service resource.
    dynamodb = boto3.resource('dynamodb');
    table = dynamodb.Table('NSEC-Users');
    ts = datetime.datetime.utcnow();
    params = event['request']['userAttributes'];
    
    
    table.put_item(Item={
        'name': params['name'],
        'group': 'test' #params['group'],
    })
    
    return event;
