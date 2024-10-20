" An example for a vimrc file.
"
" Maintainer:	Bram Moolenaar <Bram@vim.org>
" Last change:	2002 Sep 19
"
" To use it, copy it to
"     for Unix and OS/2:  ~/.vimrc
"	      for Amiga:  s:.vimrc
"  for MS-DOS and Win32:  $VIM\_vimrc
"	    for OpenVMS:  sys$login:.vimrc

" When started as "evim", evim.vim will already have done these settings.
if v:progname =~? "evim"
  finish
endif

" Use Vim settings, rather then Vi settings (much better!).
" This must be first, because it changes other options as a side effect.
set nocompatible

" allow backspacing over everything in insert mode
set backspace=indent,eol,start

if has("vms")
  set nobackup		" do not keep a backup file, use versions instead
else
  set backup		" keep a backup file
endif
set history=50		" keep 50 lines of command line history
set ruler		" show the cursor position all the time
set showcmd		" display incomplete commands
set incsearch		" do incremental searching

" For Win32 GUI: remove 't' flag from 'guioptions': no tearoff menu entries
" let &guioptions = substitute(&guioptions, "t", "", "g")

" Don't use Ex mode, use Q for formatting
map Q gq

" This is an alternative that also works in block mode, but the deleted
" text is lost and it only works for putting the current register.
"vnoremap p "_dp

" Switch syntax highlighting on, when the terminal has colors
" Also switch on highlighting the last used search pattern.
if &t_Co > 2 || has("gui_running")
  syntax on
  set hlsearch
endif

" Only do this part when compiled with support for autocommands.
if has("autocmd")

  " Enable file type detection.
  " Use the default filetype settings, so that mail gets 'tw' set to 72,
  " 'cindent' is on in C files, etc.
  " Also load indent files, to automatically do language-dependent indenting.
  filetype plugin indent on

  " Put these in an autocmd group, so that we can delete them easily.
  augroup vimrcEx
  au!

  " For all text files set 'textwidth' to 78 characters.
  autocmd FileType text setlocal textwidth=78

  " When editing a file, always jump to the last known cursor position.
  " Don't do it when the position is invalid or when inside an event handler
  " (happens when dropping a file on gvim).
  autocmd BufReadPost *
    \ if line("'\"") > 0 && line("'\"") <= line("$") |
    \   exe "normal g`\"" |
    \ endif

  augroup END

else

  set autoindent		" always set autoindenting on

endif " has("autocmd")


"Gap stuff
if has("syntax")
	  syntax on            " Default to no syntax highlightning 
else 
	syntax on
endif

" For GAP files
augroup gap
   " Remove all gap autocommands
   au!
   autocmd BufRead,BufNewFile *.g,*.gi,*.gd source ~/.vim/gap.vim
   autocmd BufRead,BufNewFile *.g,*.gi,*.gd set filetype=gap comments=s:##\ \ ,m:##\ \ ,e:##\ \ b:#  

augroup END

"latex stuff
"   \ll = save and run latex (on current file)
map \ll :w<CR>:!latex %<CR>

"C++ stuff
"" \cc = save and run g++
map \cc :w<CR>:!g++ % -o out<CR>
  
"auto completion
map! ^P ^[a. ^[hbmmi?\<^[2h"zdt.@z^Mywmx`mP xi
map! ^N ^[a. ^[hbmmi/\<^[2h"zdt.@z^Mywmx`mP xi
    
"escape map to something easy
imap <M-j> <Esc> 

"softtabs
set expandtab
set shiftwidth=2
set smarttab
set tabstop=4
"syntax enable
:map <F3> :let @/ = "" <CR>
":nnoremap <CR> :noh<CR>
:nmap <silent> <C-N> :silent noh<CR>

autocmd BufNewFile,BufReadPost *.ino,*.pde set filetype=cpp
