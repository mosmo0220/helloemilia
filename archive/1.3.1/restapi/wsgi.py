from crypt import methods
from flask import Flask, jsonify, request
import mysql.connector
import json

APPVERSION = "1.4.0"
app = Flask(__name__)

def SQLResult(sql):
  _db = mysql.connector.connect()
  _cur = _db.cursor()
  
  _cur.execute(sql)
  result = _cur.fetchall()

  _cur.close()
  _db.close()
  return result

def loadStory(x):
  res = ""
  lines = []
  with open('./stories/' + str(x) + '.txt') as f:
    lines = f.readlines()
  f.close()

  nlines = []
  for x in lines:
      nstring = x.replace("\n", "<br/>")
      nlines.append(nstring)
  for x in nlines:
      res += x
  return res

def declassifiedList():
  res = ""
  xres = SQLResult("SELECT content FROM unsecured;")
  for x in xres:
    res += str(x[0]).replace('\n', "<br/>") + "<br/>"

  return res

def returnTemplate(command, argv, daypicmax):
  template = json.loads(SQLResult("SELECT template FROM app;")[0][0])

  respond = {}
  daypic = -1
  lgate = False

  if command in template:
    category = template[command]
    if argv == "empty":
      if "basic" in category:
        respond = category["basic"]
      else:
        respond = category["notfound"]
    else:
      if "argv" in category:
        cargv = category["argv"]
        if argv in cargv:
          respond = cargv[argv]
        elif "typeof" in cargv:
          typeof = cargv["typeof"]
          if argv.isdigit():
            if "number" in typeof:
              respond = typeof["number"]
              daypic = int(argv)

              lgate = ((daypic >= 0 and daypic >= daypicmax) or (daypic >= 0 and daypic <= 7) or (daypic < 50 and daypic > 7 and daypic % 7 == 0)) and daypic < 100
              if lgate == False:
                respond = {
                    "type": "text-return",
                    "c": "Wybrany dzień jest poza zakresem"
                }
        else:
          respond = category["notfound"]
      else:
        respond = category["notfound"]
  else:
    respond = template["notfound"]
  return {
    "respond": respond,
    "daypic": daypic,
    "lgate": lgate
  }

@app.route("/query", methods=["POST"])
def query():
  command = request.form['command']
  argv = request.form['argv']
  daypicmax = SQLResult("SELECT picmax FROM app")[0][0]

  _template = returnTemplate(command, argv, daypicmax)
  respond = _template["respond"]
  daypic = _template["daypic"]
  lgate = _template["lgate"]

  # Types
  # text-return / duo-value-return / list-return / easter-return / else
  if respond["type"] == "text-return":
    respond = {
      "respond": respond["c"]
    }
  elif respond["type"] == "duo-value-return":
    res = []
    let = respond["c"]
    skip = False
    for obj in let:
      if skip:
        skip = False
        continue
      x = obj[0]
      y = obj[1]
      z = ""

      # :hidden-eggs
      if y == ":hidden-eggs":
        a = SQLResult("SELECT eggs FROM app;")[0][0]
        comp = x + str(a)
        res.append(comp)
        continue

      # :sekked-eggs
      if y == ":sekked-eggs":
        a = "Nie zaimplementowano"
        comp = x + str(a)
        res.append(comp)
        continue

      if y == "link":
        z = obj[2]
        comp = x + "[link]" + z
        res.append(comp)

      # :aplication-version
      if y == ":aplication-version":
        a = APPVERSION
        comp = x + a
        res.append(comp)
        continue

      # link -> skip -> compare to obj
        # daypic
        # :selected-day
        # :content-day
        # txt:stories ifskip
        # :type-day watchskip

      if ":final" in y:
        b = SQLResult("SELECT content, type, story, storytitle FROM days WHERE day < 8 AND day > 0")
        for u in b:
          res.append(u)

      if lgate:
        b = SQLResult("SELECT content, type, story, storytitle FROM days WHERE day = " + str(daypic))[0]
        if y == ":selected-day":
          a = daypic
          comp = x + str(a)
          res.append(comp)
        elif y == ":content-day":
          a = b[0]
          comp = x + str(a)
          res.append(comp)
        elif y == "txt:stories":
          if b[1] == "story":
             p = str(b[3])
             res.append(p)
             c = loadStory(b[2])
             res.append(x + c)
             skip = True
        elif y == ":type-day":
          a = b[1]
          comp = x + str(a)
          res.append(comp)
        else:
          comp = x + y
          res.append(comp)
        continue
      # :max-day
      if y == ":max-day":
        a = daypicmax
        comp = x + str(a)
        res.append(comp)
        continue
    respond = {
      "respond": res
    }
  elif respond["type"] == "list-return":
    let = respond["c"]
    if let == ":declassified-list":
      respond = {
        "respond": declassifiedList()
      }
  elif respond["type"] == "easter-return":
    res = []
    x = "Easter respond nr. " + str(respond["number"])
    let = respond["c"]
    for obj in let:
      x = obj[0]
      y = obj[1]

      if y == "link":
        z = obj[2]
        comp = x + "[link]" + z
        res.append(comp)
      else:
        comp = x + y
        res.append(comp)
    respond = {
      "respond": res
    }
  else:
    respond = {
      "respond": "Błąd w interpretacji typu zwrotu"
    }


  respond = jsonify(respond)
  respond.headers.add('Access-Control-Allow-Origin', '*')

  return respond

if __name__ == "__main__":
  app.run()
