Rename local branch
-------------------

    git branch -m {{oldname}} {{newname}}
    git branch -m {{newname}}

Pretty git log history
----------------------

    git log --graph --decorate

Get all remote branches
-----------------------

    git fetch --all

I fucked up, reset, hard
------------------------

    git reset --hard

Too much cruft, remote it ALL
-----------------------------

    git clean -xdf

Too lazy, save password for a few minutes
-----------------------------------------

    git config --global credential.helper cache

Crap, just commited password file but haven't pushed
----------------------------------------------------

    git config --global alias.undo-commit 'reset --soft HEAD^'
    git undo-commit


