let nodesArray;
let edgesArray;
let network;
let infoPanel = document.getElementById('info');


document.getElementById('fileInput').addEventListener('change', handleFiles, false);

function addObjectIfNotExists(list, newObj) {
    const exists = list.some(obj => obj.value === newObj.value);
    if (!exists) {
        list.push(newObj);
    }
}


function compactUri(uri, prefixes, unknownNamespaces) {
    for (const [prefix, namespace] of Object.entries(prefixes)) {
        if (uri.startsWith(namespace)) {
            return uri.replace(namespace, prefix + ':');
        } else {
            for (const unknownNamespace of unknownNamespaces) {

                if (uri.startsWith(unknownNamespace)) {
                    return uri.replace(unknownNamespace, ' :');
                }
            }
        }

    }
    return uri;
}

function findUnknownNamespaces(prefixes) {
    const unknownNamespaces = [];

    Object.values(prefixes).forEach(prefix => {
        if (prefix[prefix.length - 1] === '/') {
            unknownNamespaces.push(prefix.substring(0, prefix.length - 1) + '#');
        }

    })

    return unknownNamespaces;
}

function addNodeToList(nodeList, newNode) {
    addObjectIfNotExists(nodeList, newNode)
}

function getNodeId(nodeList, neededNode) {
    return nodeList.findIndex(node => node.id === neededNode.id)
}
function getEdgeId(edgeList, neededEdge) {
    return edgeList.findIndex(edge => edge.label === neededEdge.label && edge.from === neededEdge.from && edge.to === neededEdge.to)
}


function wrapText(inputString) {
    let result = '';
    for (let i = 0; i < inputString.length; i += 20) {
        result += inputString.substring(i, i + 20) + '\n';
    }
    return result;
}
function removeNewLines(inputString) {
    return inputString.replace(/\n/g, '');
}



function searchNodes() {
    var input = document.getElementById('searchBoxNode').value;
    if (!nodesArray) {
        infoPanel.innerHTML = 'you need to select a file'
        return
    }
    var results = nodesArray.get({
        filter: function (node) {
            return node.label.toLowerCase().includes(input.toLowerCase());
        }
    });
    displaySearchNodesResults(results);
}
function searchEdges() {
    var input = document.getElementById('searchBoxEdge').value;
    if (!edgesArray) {
        infoPanel.innerHTML = 'you need to select a file'
        return
    }
    var results = edgesArray.get({
        filter: function (node) {
            return node.label.toLowerCase().includes(input.toLowerCase());
        }
    });
    displaySearchEdgesResults(results);
}

function displaySearchNodesResults(results) {
    var resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';
    results.forEach(function (node) {
        var nodeDiv = document.createElement('div');
        nodeDiv.innerHTML = removeNewLines(node.label);
        nodeDiv.style.cursor = 'pointer';
        nodeDiv.style.margin = '5px';
        nodeDiv.style.padding = '2px';
        nodeDiv.style.background = '#e8e8e8';
        nodeDiv.onclick = function () { clickNode(node.id); };
        resultsDiv.appendChild(nodeDiv);
    });
}
function displaySearchEdgesResults(results) {
    var resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';
    results.forEach(function (edge) {
        var nodeDiv = document.createElement('div');
        nodeDiv.innerHTML = `${removeNewLines(nodesArray.get(edge.from).label)} <b>${removeNewLines(edge.label)}</b> ${removeNewLines(nodesArray.get(edge.to).label)}`
        nodeDiv.style.cursor = 'pointer';
        nodeDiv.style.margin = '5px';
        nodeDiv.style.padding = '2px';
        nodeDiv.style.background = '#e8e8e8';
        nodeDiv.onclick = function () { clickEdge(edge.id); };
        resultsDiv.appendChild(nodeDiv);
    });
}

function clickNode(nodeId) {
    network.selectNodes([nodeId]);
    network.emit("click", { nodes: [nodeId] });
}

function clickEdge(edgeId) {
    network.selectEdges([edgeId]);
    network.emit("click", {
        nodes: [],
        edges: [edgeId]
    });
}


function showNodeDetails(nodeId) {
    var nodeData = nodesArray.get(nodeId);
    var connectedNodes = network.getConnectedNodes(nodeId);
    var connectedEdges = network.getConnectedEdges(nodeId);
    nodesArray.update([...nodesArray.get()].map(node => ({
        id: node.id,
        hidden: !connectedNodes.includes(node.id) && node.id !== nodeId
    })));
    edgesArray.update([...edgesArray.get()].map(edge => ({
        id: edge.id,
        hidden: !connectedEdges.includes(edge.id)
    })));
    let idx = 0;
    var edgesInfo = connectedEdges.map(edgeId => {
        var edge = edgesArray.get(edgeId);
        idx++;
        return `${idx}) ${removeNewLines(nodesArray.get(edge.from).label)} <span style="font-weight: 900;">${removeNewLines(edge.label)}</span> ${removeNewLines(nodesArray.get(edge.to).label)}`
    }).join('<br>');
    infoPanel.innerHTML = `Name: <b>${removeNewLines(nodeData.label)}</b><br>Edges:<br> ${edgesInfo}`;

}

function showEdgeDetails(edgeId) {
    var edgeData = edgesArray.get(edgeId);
    nodesArray.update([...nodesArray.get()].map(node => ({
        id: node.id,
        hidden: node.id !== edgeData.from && node.id !== edgeData.to
    })));
    edgesArray.update([...edgesArray.get()].map(edge => ({
        id: edge.id,
        hidden: edge.id !== edgeId
    })));
    infoPanel.innerHTML = `Edge: <b>${removeNewLines(edgeData.label)}</b><br> From ${removeNewLines(nodesArray.get(edgeData.from).label)}<br>to: ${removeNewLines(nodesArray.get(edgeData.to).label)}`;
}

function resetVisibility() {
    nodesArray.update([...nodesArray.get()].map(node => ({ id: node.id, hidden: false })));
    edgesArray.update([...edgesArray.get()].map(edge => ({ id: edge.id, hidden: false })));
    infoPanel.innerHTML = 'Click on a node or an edge to see details here.';
}


function handleFiles() {
    const file = this.files[0];
    const reader = new FileReader();
    reader.onload = function () {
        const text = reader.result;
        const parser = new N3.Parser();
        let nodes = [];
        let edges = [];
        let prefixes = {};

        parser.parse(text, (error, triple, _prefixes) => {
            if (triple) {

                prefixes = { ...prefixes, ..._prefixes }


                let subject = triple.subject
                let object = triple.object
                let predicate = triple.predicate

                addNodeToList(nodes, subject)
                addNodeToList(nodes, object)
                edges.push({ from: getNodeId(nodes, subject), to: getNodeId(nodes, object), label: predicate });

            } else {
                const unknownNamespaces = findUnknownNamespaces(_prefixes)


                nodesArray = new vis.DataSet(Array.from(nodes).map(node => {
                    return ({ id: getNodeId(nodes, node), label: wrapText(compactUri(node.id, _prefixes, unknownNamespaces)) })
                }));
                edgesArray = new vis.DataSet(Array.from(edges).map(edge => {
                    return ({ ...edge, id: getEdgeId(edges, edge), label: wrapText(compactUri(edge.label.id, _prefixes, unknownNamespaces)) })
                }))

                const container = document.getElementById('mynetwork');
                const data = {
                    nodes: nodesArray,
                    edges: edgesArray
                };

                // todo: customize this more
                const options = {
                    nodes: {
                        font: {
                            multi: 'html'
                        }
                    },
                    interaction: {
                        // navigationButtons: true
                        // hover: false,
                        // tooltipDelay: 200,
                        // hideEdgesOnDrag: true
                    },
                    physics: {
                        enabled: false
                    },
                    // physics: {
                    //     solver: 'barnesHut',
                    //     barnesHut: {
                    //         gravitationalConstant: -8000,
                    //         gravitationalConstant: 0,
                    //         // centralGravity: 0.3,
                    //         centralGravity: 0,
                    //         springLength: 95,
                    //         // springConstant: 0.04,
                    //         springConstant: 0.04,
                    //         damping: 0.09,
                    //         avoidOverlap: 0.1
                    //     }
                    // },
                    edges: {
                        smooth: false,
                        arrows: 'to'
                    },
                    layout: {
                        improvedLayout: true
                    }
                }
                network = new vis.Network(container, data, options);

                network.on("click", function (params) {
                    if (params.nodes.length > 0) {
                        showNodeDetails(params.nodes[0]);
                    } else if (params.edges.length > 0) {
                        showEdgeDetails(params.edges[0]);
                    } else {
                        resetVisibility();
                    }
                });


            }
        });
    };

    reader.readAsText(file);
}





