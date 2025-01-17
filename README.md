## dis-dat

"Run commands in parallel with dad (dis-and-dat) or sequentially with dtd (dis-then-dat)

```
# dis and dat: all in parallel
$ dad "npm test" "eslint ."

# dis then dat: one then the other, stopping if one fails
$ dtd "npm install" "npm test"
```
