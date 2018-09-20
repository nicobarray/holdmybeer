# Hold my beer

A collection of DX tools.

# Tools

## fork-npm (default)

:warning: This project is a work in progress, use with caution.

Clone any repository, build it and publish it as a scopped package.
Usefull to try a specific branch or project PR.

| Option       | Default                                                                                                                    | Description                                                                      |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| url          | github.com                                                                                                                 | The registry to clone from.                                                      |
| project      | yahwastaken/holdmybeer                                                                                                     | The repository to clone (owner/name).                                            |
| branch       | master                                                                                                                     | The branch to clone from.                                                        |
| scope        | null                                                                                                                       | The scope to use when publishing the package over npm.                           |
| otp          | null                                                                                                                       | The one-time password asked if configured on every package publications over npm |
| forceVersion | The current version append with `-${scope}.n`. If a version already exists then `-${scope}.(n+1)`. Starts at `-${scope}.1` | The version to publish the package with                                          |


## More

If more tools come under this cli, they will be under namespaces as follow

```
holdmybeer [tool-name] [options]
```
