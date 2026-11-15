declare module 'virtual:ade-editor-documents' {
  const documents: {
    readonly current: import('../../../compiler/reference-house/current-design/snapshot.js').DesignSnapshot
    readonly partitionStudy: import('../../../compiler/reference-house/current-design/snapshot.js').DesignSnapshot
  }
  export default documents
}
