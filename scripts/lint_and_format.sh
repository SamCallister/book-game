set -e
# python
black src/python
flake8 src/python

# javascript lint
npx prettier --write src/js
npm run lint