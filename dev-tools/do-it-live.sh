#! /bin/bash
COMMIT_MESSAGE

if [ -z "$1" ]; then
  COMMIT_MESSAGE="doin it live"
else 
  COMMIT_MESSAGE="$1"
fi

echo "building"
npm run build
echo "building"
git add .
echo "building"
git commit -m "$COMMIT_MESSAGE"
echo "building"
git push heroku master