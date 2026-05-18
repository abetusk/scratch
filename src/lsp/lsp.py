#!/usr/bin/python3
#
# To the extent possible under law, the person who associated CC0 with
# this project has waived all copyright and related or neighboring rights
# to this project.
# 
# You should have received a copy of the CC0 legalcode along with this
# work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
#

# following https://paulgraham.com/rootsoflisp.html

import re

def lsp_env():
  _env = {
    "parent" : None
  }
  return _env

# i : integer
# d : float
# a : array/list
# p : proc (?)
# f : lambda
#
def lsp_ele(_type, val):
  return { "type": _type, "val": val }


def is_atom(a):
  return True

###
###
###

def lsp_parse(inp):
  return inp.replace('(', ' ( ').replace(')', ' ) ').split()

def lsp_ast(rtok, ctx = None):

  is_root = False
  if ctx == None:
    is_root = True
    ctx = {
      "return": True,
      "comment": '',
      "ast_root": [],
      "ast_cur": None
    }

  if len(rtok) == 0:
    ctx["return"] = False
    ctx["comment"] = "empty list"
    return ctx

  t = rtok.pop()
  if t != '(':
    ctx["return"] = False
    ctx["comment"] = "no beginning '('"
    return ctx

  ast_cur = {
    "type": "a",
    "val": []
  }
  while t != ')':

    if len(rtok)==0:
      ctx["return"] = False
      ctx["comment"] = "bad parse(0)"
      return ctx

    t = rtok[ len(rtok)-1 ]

    if t == ')':
      t = rtok.pop()
      break

    if t == '(':
      lsp_ast( rtok, ctx )
      ast_cur.append( ctx["ast_cur"] )
      if not ctx["return"]: return ctx
      continue

    if is_atom(t):
      ast_cur.append( t )
      t = rtok.pop()
      continue

    ctx["return"] = False
    ctx["comment"] = "bad parse"
    return ctx

  ctx["ast_cur"] = ast_cur
  if is_root:
    ctx["ast_root"] = ast_cur

  return ctx

###
###
###

def lsp_eval(ctx, ast = None):

  if ast == None:
    ast = ctx["ast_root"]

  for v in ast:
    print(v)


###
###
###


def repl(prompt='> '):
  while True:

    tok = lsp_parse(input(prompt))
    rtok = []
    for idx in range(len(tok)):
      rtok.append( tok[len(tok)-1-idx] )

    ctx = lsp_ast(rtok)
    print("##", ctx)

    lsp_eval(ctx)




repl()
