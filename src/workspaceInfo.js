let workspacePath = null;
let workspaceId = null;

function updateWorkspacePath(path) {
  workspacePath = path;
}

function getWorkspacePath() {
  return workspacePath;
}

function updateWorkspaceID(id) {
  workspaceId = id;
}

function getWorkspaceId() {
  return workspaceId;
}

module.exports = {
  updateWorkspacePath,
  getWorkspacePath,
  updateWorkspaceID,
  getWorkspaceId,
};
