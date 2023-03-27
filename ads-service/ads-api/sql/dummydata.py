import sqlite3

conn = sqlite3.connect('database.db')

cur =  conn.cursor()

#insert data into users table

cur.execute("INSERT INTO users (type, name, email, password) VALUES (?, ?, ?, ?)", ('A', 'Pingo Doce', 'pingodoce@example.com', 'password123'))
cur.execute("INSERT INTO users (type, name, email, password) VALUES (?, ?, ?, ?)", ('A', 'Auchan', 'auchan@example.com', 'password456'))
cur.execute("INSERT INTO users (type, name, email, password) VALUES (?, ?, ?, ?)", ('C', 'Mixit', 'mixit@example.com', 'mixit123'))

#insert data into ads table

cur.execute("INSERT INTO ads (type, description, pricing_model, age_range, location, ad_creative, impressions, clicks, user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", ('image', 'Pingo Doce for the youth', 'CPC', 'youth', 'Portugal', 'https://play-lh.googleusercontent.com/-KY7h2o5K2v9RgHpT_AGus3CfkE9FqEyGpxqGhLApkjt1RR_7m83pHM8tA2nWnYXNUnb', 235, 31, 1))
cur.execute("INSERT INTO ads (type, description, pricing_model, age_range, location, ad_creative, impressions, clicks, user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", ('video', 'Ping doce for the adults', 'CPM', 'adults', 'France', 'https://example.com/video1.mp4', 1000, 0, 1))
cur.execute("INSERT INTO ads (type, description, pricing_model, age_range, location, ad_creative, impressions, clicks, user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", ('image', 'Auchan for the seniors', 'CPC', 'seniors', 'Portugal', 'https://www.marshopping.com/matosinhos/-/media/images/b2c/portugal/matosinhos/images-stores/auchan/auchan_logo_2019.ashx?h=282&iar=0&mw=650&w=410&hash=6080628DA88F979CC8A18AFD71469B76', 476, 109, 2))

conn.commit()

print('Data inserted successfully')

conn.close()

