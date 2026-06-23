#!/usr/bin/python3

grid_size = [10,10]

grid = []

init_pos = [0,0]
anti_pos = [ [3,3], [5,5] ]


def new_grid(grid_size):
  g = []
  for y in range(grid_size[1]):
    g.append([])
    for x in range(grid_size[0]):
      g[y].append(0)
  return g

def print_grid(g):
  w = 6
  for y in range(len(g)):
    a = []
    for x in range(len(g[y])):
      v = g[y][x]
      s = str(v)
      a.append( " "*(w-len(s)) + str(v) )
    #print( " ".join(list(map(str, g[y]))) )
    print( " ".join(a) )

def print_grid2(g,h):
  w = 6
  for y in range(len(g)):
    a = []
    for x in range(len(g[y])):
      v = g[y][x] + h[y][x]
      s = str(v)
      a.append( " "*(w-len(s)) + str(v) )
    print( " ".join(a) )

def sub_grid(g,h):
  w = 6
  for y in range(len(g)):
    a = []
    for x in range(len(g[y])):
      v = g[y][x] - h[y][x]
      s = str(v)
      a.append( " "*(w-len(s)) + str(v) )
    print( " ".join(a) )


#grid[0][0] = 1
#grid[3][3] = -1

def zero_grid(grid, grid_size):
  for y in range(grid_size[1]):
    for x in range(grid_size[0]):
      grid[y][x] = 0


def dp_grid(grid, grid_size, init_pos, anti_pos):

  grid[init_pos[1]][init_pos[0]] = 1
  for i in range(len(anti_pos)):
    grid[anti_pos[i][1]][anti_pos[i][0]] = -1

  for y in range(grid_size[1]):
    for x in range(grid_size[0]):

      if (x==0) and (y==0):
        grid[y][x] = 1
        continue

      if grid[y][x] == -1: continue

      a,b = 0,0
      if (y>0): a = grid[y-1][x]
      if (x>0): b = grid[y][x-1]

      if a<0: a = 0
      if b<0: b = 0

      grid[y][x]=a+b

def anti_dp_grid(grid, grid_size, init_pos, anti_pos):

  grid[init_pos[1]][init_pos[0]] = 1
  for i in range(len(anti_pos)):
    grid[anti_pos[i][1]][anti_pos[i][0]] = -1


  antigrid = []
  for y in range(grid_size[1]):
    antigrid.append([])
    for x in range(grid_size[0]):
      if grid[y][x] < 0:
        antigrid[y].append( grid[y][x] )
      else:
        antigrid[y].append( 0 )

  for y in range(grid_size[1]):
    for x in range(grid_size[0]):

      if (x==0) and (y==0):
        grid[y][x] = 1
        continue

      a,b = 0,0
      u,v = 0,0

      if (y>0):
        a = grid[y-1][x]
        u = antigrid[y-1][x]

      if (x>0):
        b = grid[y][x-1]
        v = antigrid[y][x-1]

      grid[y][x]=a+b
      #antigrid[y][x] = (antigrid[y][x]*grid[y][x]) + u + v

      antigrid[y][x] = (antigrid[y][x]*grid[y][x]) + ((1+antigrid[y][x])*(u+v))

      #if antigrid[y][x] < 0: antigrid[y][x] = (antigrid[y][x]*grid[y][x])
      #else: antigrid[y][x] = u+v

  #print("===")
  #print_grid(antigrid)

  print("===")
  print_grid2(grid, antigrid)

g0 = new_grid(grid_size)
g1 = new_grid(grid_size)
g2 = new_grid(grid_size)


dp_grid(g0, grid_size, init_pos, anti_pos)
print_grid(g0)

#print("----")
#dp_grid(g1, grid_size, init_pos, [])
#print_grid(g1)
#print("----")

zero_grid(g2, grid_size)
anti_dp_grid(g2, grid_size, init_pos, anti_pos)

#print_grid(g2)


