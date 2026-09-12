# dis-dat

Run shell commands in parallel with `dad` or sequentially with `dtd`.

## Install

```sh
npm install --global dis-dat
```

## Use

```sh
# Start both commands at once.
dad "npm test" "npm run lint"

# Run the second command only if the first succeeds.
dtd "npm install" "npm test"
```

Both commands print each command and return a non-zero exit status when a command fails. Quote each command so its arguments stay together. The package also exports a promise and callback API for running command strings from Node.js.

## Documentation

See the [API documentation](https://kmalakoff.github.io/dis-dat/) for concurrency, streaming, and programmatic usage.
