const X_SPACING = 100

// core functions
function createStand(node, id) {
    let stand = getSavedStand(id)
    let offset = 0
    stand.variations.forEach((variation, index) => {
        createVariation(node, variation.width, variation.height, offset)
        offset += variation.width + X_SPACING
    })
}

function createVariation(node, width, height, offset) {
    let clone = (node.type === 'COMPONENT') ? node.createInstance() : node.clone();
    clone.resize(width, height)
    clone.x = node.x + node.width + X_SPACING + (offset || 0)
    clone.y = node.y
}

function dumpBoutique() {
    figma.root.setPluginData('boutique', '')
}

function saveBoutique(boutique) {
    figma.root.setPluginData('boutique', boutique)
}

function getSavedBoutique() {
    let boutique = figma.root.getPluginData('boutique')
    return (boutique === '') ? [] : JSON.parse(boutique);
}

function getSavedStand(standId) {
    let boutique = getSavedBoutique()
    return boutique[standId]
}

function getSavedVariation(standId, variationId) {
    let stand = getSavedStand(standId)
    return stand.variations[variationId]
}

function renderFromSavedState() {
    var boutique = getSavedBoutique()
    if (boutique.length === 0) {
        figma.ui.postMessage({ type: 'empty' })
    } else {
        figma.ui.postMessage({ type: 'render', boutique: boutique })
    }
}


// Get saved config and render UI
figma.showUI(__html__, {width: 320, height: 480})
renderFromSavedState()


// Listen for actions in the UI
figma.ui.onmessage = msg => {

    if (msg.type === 'run-stand') {
        let source = figma.currentPage.selection
        source.forEach(node => {
            createStand(node, msg.standId)
        })
    }

    if (msg.type === 'run-variation') {
        let source = figma.currentPage.selection
        let variation = getSavedVariation(msg.standId, msg.variationId)
        source.forEach(node => {
            createVariation(node, variation.width, variation.height)
        })
    }

    if (msg.type === 'request-import') {
        let boutique = msg.data
        saveBoutique(boutique)
        renderFromSavedState()
    }

    if (msg.type === 'request-export') {
        console.log('code.js export')
    }

    if (msg.type === 'request-dump') {
        saveBoutique('')
        renderFromSavedState()
    }

    // figma.closePlugin();
};
