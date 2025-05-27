
# from https://stackoverflow.com/questions/34142292/gnuplot-3d-time-animation-from-data-file

# define fixed axis-ranges
set xrange [-1:1]
set yrange [0:20]
set zrange [-1:1]

# filename and n=number of lines of your data 
filedata = 'data.dat'
n = system(sprintf('cat %s | wc -l', filedata))

do for [j=1:n] {
    set title 'time '.j
    splot filedata u 2:3:4 every ::1::j w l lw 2, \
          filedata u 2:3:4 every ::j::j w p pt 7 ps 2
}
