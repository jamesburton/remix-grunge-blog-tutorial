@app
blog-tutorial-5e99

@aws
region eu-west-2
profile default

@http
/*
  method any
  src server

@static

@tables
user
  pk *String

password
  pk *String  # userId

note
  pk *String  # userId
  sk **String # noteId

network
  pk *String  # userId
  sk **String # networkId

coin
  pk *String  # userId
  sk **String # coinId

@tables-indexes
user
  pk *String
  email **String
  name byEmail

coin
  userId *String
  token **String
  name byToken

coin
  userId *String
  networkId **String
  name byNetworkId

