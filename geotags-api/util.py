import os
import string
import random

random.seed(os.urandom(32))

def random_string(length):
    
    return ''.join([
        random.choice(string.uppercase + string.lowercase + string.digits)
        for i in range(length) ])