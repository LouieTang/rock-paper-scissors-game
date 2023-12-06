#this one is the old one

import os

target_name = 'image.jpg'

old_name= 'image (1).jpg'

# Get the path to the downloads directory
downloads_dir = os.path.expanduser('~/Downloads')

# Join the downloads directory path with the file name to create the file path
file_path = os.path.join(downloads_dir, target_name)

old_path= os.path.join(downloads_dir, old_name)

# Use the os.remove() function to remove the file
os.remove(file_path)
if os.path.exists(old_path):
    # rename the file
    os.rename(old_path, file_path)
else:
    print('The file does not exist.')
