const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');
const fs = require('fs');

async function run() {
  try {
    const token = core.getInput('token');

    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    const octokit = new Octokit({
      auth: token
    });

    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    const url = core.getInput('upload_url', { required: true });
    const repoOwner = core.getInput('repo_owner', { required: true });
    const repoName = core.getInput('repo_name', { required: true });
    const releaseId = core.getInput('release_id', { required: true });
    const assetPath = core.getInput('asset_path', { required: true });
    const assetName = core.getInput('asset_name', { required: true });
    const assetContentType = core.getInput('asset_content_type', { required: true });

    // Determine content-length for header to upload asset
    const contentLength = filePath => fs.statSync(filePath).size;

    // Setup headers for API call, see Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset for more information
    const headers = { 'content-type': assetContentType, 'content-length': contentLength(assetPath) };

    // Upload a release asset
    const uploadAssetResponse = await octokit.rest.repos.uploadReleaseAsset({
      headers,
      owner: repoOwner,
      repo: repoName,
      release_id: releaseId,
      name: assetName,
      label: assetName,
      data: fs.readFileSync(assetPath),
      origin: url
    });

    // Get the browser_download_url for the uploaded release asset from the response
    const {
      data: { browser_download_url: browserDownloadUrl }
    } = uploadAssetResponse;

    // Set the output variable for use by other actions: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    core.setOutput('browser_download_url', browserDownloadUrl);
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;
