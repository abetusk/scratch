### Rename local branch

```bash
git branch -m {{oldname}} {{newname}}
git branch -m {{newname}}
```

### Pretty git log history

    git log --graph --decorate

### Get all remote branches

    git fetch --all

### I fucked up, reset, hard

    git reset --hard

### Too much cruft, remote it ALL

    git clean -xdf

### Too lazy, save password for a few minutes

    git config --global credential.helper cache

### Crap, just commited password file but haven't pushed

    git config --global alias.undo-commit 'reset --soft HEAD^'
    git undo-commit

### Someone merged my pull request...how do I merge it back into mine?

    git checkout release
    git remote add {{remote_name}} {{remote_url}}
    git fetch {{remote_name}}
    git merge {{remote_name}}/release
    
    
### Remotes?

    git remote -v

### Clone all submodules

    git clone --recurseive {{repo_url}}
    
### Forgot to recursively clone submodules

    cd {{repo}}
    git submodule update --init

    
