# GitHub Action - Releases API

This GitHub Action (written in JavaScript) wraps the [GitHub Release API](https://developer.github.com/v3/repos/releases/), specifically the [Upload a Release Asset](https://developer.github.com/v3/repos/releases/#upload-a-release-asset) endpoint, to allow you to leverage GitHub Actions to upload release assets.

<a href="https://github.com/dream-encode/upload-release-asset-node16"><img alt="GitHub Actions status" src="https://github.com/dream-encode/upload-release-asset-node16/workflows/Tests/badge.svg"></a>

## Usage
### Pre-requisites
Create a workflow `.yml` file in your repositories `.github/workflows` directory. An [example workflow](#example-workflow---upload-a-release-asset) is available below. For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file). You also will need to have a release to upload your asset to, which could be created programmatically by [`@actions/create-release`](https://www.github.com/actions/create-release) as show in the example workflow.

### Inputs
For more information on these inputs, see the [API Documentation](https://developer.github.com/v3/repos/releases/#input-2)

- `upload_url`: The URL for uploading assets to the release, which could come from another GitHub Action, for example the [`@actions/create-release`](https://www.github.com/actions/create-release) GitHub Action

### Outputs
For more information on these outputs, see the [API Documentation](https://developer.github.com/v3/repos/releases/#response-for-successful-upload) for an example of what these outputs look like

- `id`: The ID of the asset
- `browser_download_url`: The URL users can navigate to in order to download the release asset. i.e. `https://github.com/octocat/Hello-World/releases/download/v1.0.0/example.zip`

### Example workflow - upload a release asset
On every `push` to a tag matching the pattern `v*`, [create a release](https://developer.github.com/v3/repos/releases/#create-a-release) and [upload a release asset](https://developer.github.com/v3/repos/releases/#upload-a-release-asset). This Workflow example assumes you have the [`@actions/create-release`](https://www.github.com/actions/create-release) Action in a previous step:

```yaml
on:
  push:
    # Sequence of patterns matched against refs/tags
    tags:
    - 'v*' # Push events to matching v*, i.e. v1.0, v20.15.10

name: Upload Release Asset

jobs:
  build:
    name: Upload Release Asset
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Build project # This would actually build your project, using zip for an example artifact
        run: |
          zip --junk-paths my-artifact README.md
      - name: Create Release
        id: create_release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
      - name: Upload release assets
        uses: dream-encode/upload-release-asset-node16@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          repo_owner: ${{ github.event.repository.owner.login }}
          repo_name: ${{ github.event.repository.name }}
          release_id: ${{ steps.create_release.outputs.id }}
          asset_path: ${{ github.event.repository.name }}-${{ github.ref }}.zip
          asset_name: ${{ github.event.repository.name }}-${{ github.ref }}.zip
          asset_content_type: application/zip
          upload_url: ${{ steps.create_release.outputs.upload_url }}
```

This will upload a release artifact to an existing release, outputting the `browser_download_url` for the asset which could be handled by a third party service, or by GitHub Actions for additional uses. For more information, see the GitHub Documentation for the [upload a release asset](https://developer.github.com/v3/repos/releases/#upload-a-release-asset) endpoint.

## Contributing
We would love you to contribute to `@actions/upload-release-asset`, pull requests are welcome! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) for more information.

## License
The scripts and documentation in this project are released under the [MIT License](LICENSE)
