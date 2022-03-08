// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";

// Inputs optional for req.query
// platforms (required), can be passed as array or single value
// blockNumber (default is currentBlock), must be int
export default async function handler(req, res) {
    try {

        var blockNumber;
        if ('blockNumber' in req.query) {
            blockNumber = parseInt(req.query.blockNumber);
            if (isNaN(blockNumber)) {
                res.statusCode = 400;
                return res.send({
                    "message": "Invalid type for block number!"
                });
            }
        }
        else {
            blockNumber = await getBlockNumber();
        }
        
        let checkPlatforms = false;
        let platformsSet = new Set();
        if ('platforms' in req.query) {
            checkPlatforms = true;
            var platforms = req.query.platforms;
            // Passed in multiple platforms
            if (typeof(platforms) == 'object') {
                for (var i = 0; i < platforms.length; i++) {
                    console.log(platforms[i]);
                    platforms[i] = platforms[i].toLowerCase();
                }
                platformsSet = new Set(platforms);
            }
            // Passed in one platform as string
            if (typeof(platforms) == 'string') {
                platformsSet = new Set();
                platformsSet.add(platforms.toLowerCase());
            }
        }

        var proposalMethods = new Map();
        proposalMethods.set('aave', getAaveProposals);
        proposalMethods.set('compound', getCompoundProposals);
        proposalMethods.set('uniswap', getUniswapProposals);

        let allProposals = []
        for (const [platform, getPlatformProposals] of proposalMethods.entries()) {
            if (checkPlatforms == false || platformsSet.has(platform)) {
                let platformProposals = await getPlatformProposals(blockNumber);
                if (platformProposals.length > 0) {
                    allProposals.push(...platformProposals);
                }
            }
        }
        
        return res.status(200).json({proposals: allProposals, blockNumber: blockNumber});
    }
    catch (error) {
        console.error(error);
        return res.end();
    }
    
}

// Returns integer of current block number
async function getBlockNumber() {
    const response = await axios.get('https://api.blockcypher.com/v1/eth/main');
    const blockNumber = parseInt(response.data.height);
    return blockNumber;
}

// Query all Aave proposals, and return JSON objects for each proposal
// Each proposal currently holds title, id, platform, state, endBlock & link
async function getAaveProposals(blockNumber) {
    var query = `{
        proposals(orderBy: endBlock, orderDirection: desc) {
        id
        state
        startBlock
        endBlock
        ipfsHash
        title
        shortDescription
        }
    }`;
    const response = await axios.post('https://api.thegraph.com/subgraphs/name/aave/governance-v2', {
        query: query 
    },
    {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    var allProposals = response.data.data.proposals
    var aaveProposals = [];
    var stateDefinition = {
        "failed": "defeated"
    }
    for (var i in response.data.data.proposals) {
        var proposal = allProposals[i];

        var endBlock = parseInt(proposal.endBlock);
        if (endBlock < blockNumber) {
            break;
        }

        var title = proposal.title;
        var id = proposal.id;
        var ipfsHash = proposal.ipfsHash;
        var platform = "Aave";
        var state = proposal.state;
        if (state in stateDefinition) {
            state = stateDefinition[state];
        }
        var link = "https://app.aave.com/#/governance/" + id + "-" + ipfsHash;
        var proposalJSON = {
            title: title,
            id: id,
            platform: platform,
            state: state.toLowerCase(),
            link: link,
            endBlock: endBlock
        }
        aaveProposals.push(proposalJSON);
    }
    return aaveProposals;
}


// Query all Uniswap proposals, and return JSON objects for each proposal
// Uses arr00's Uniswap Governance v2 subgraph & uni.vote api
// Each proposal currently holds title, id, platform, state, endBlock & link
async function getUniswapProposals(blockNumber) {
    var query = `{
        proposals(orderBy: endBlock, orderDirection: desc) {
            id
            status
            endBlock
        }
    }`;
    const response = await axios.post('https://api.thegraph.com/subgraphs/name/arr00/uniswap-governance-v2', {
        query: query 
    },
    {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    var allProposals = response.data.data.proposals;

    let pgs = 100;
    const response2 = await axios.get("https://uni.vote/api/governance/proposals", {
      params: {
          page_size: pgs
      }
    });
    var titleLinkInfo = response2.data.proposals;

    var uniswapProposals = [];
    for (var i in response.data.data.proposals) {
        var proposal = allProposals[i];

        var endBlock = parseInt(proposal.endBlock);
        if (endBlock < blockNumber) {
            break;
        }

        var id = proposal.id;
        var platform = "Uniswap";
        var state = proposal.status;

        var titleLinkProposal = titleLinkInfo[i];
        var title = titleLinkProposal.title;
        var link = titleLinkProposal.uniswap_url;
        var proposalJSON = {
            title: title,
            id: id,
            platform: platform,
            state: state.toLowerCase(),
            link: link,
            endBlock: endBlock
        }
        uniswapProposals.push(proposalJSON);
    }
    return uniswapProposals;
}

// Query all Compound proposals, and return JSON objects for each proposal
// Uses arr00's Compound's governance
// Each proposal currently holds title, id, platform, state, endBlock & link
async function getCompoundProposals(blockNumber) {
    var query = `{
        proposals(orderBy: endBlock, orderDirection: desc) {
        id
        status
        endBlock
        description
        }
    }`;
    const response = await axios.post('https://api.thegraph.com/subgraphs/name/arr00/compound-governance-2', {
        query: query 
    },
    {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    var allProposals = response.data.data.proposals
    var compoundProposals = [];

    for (var i in response.data.data.proposals) {
        var proposal = allProposals[i];

        var endBlock = parseInt(proposal.endBlock);
        if (endBlock < blockNumber) {
            break;
        }

        var id = proposal.id;
        var platform = "Compound";
        var state = proposal.status;

        var description = proposal.description;
        var title = description.split("\n")[0].substring(2);


        var link = "https://compound.finance/governance/proposals/" + id;
        var proposalJSON = {
            title: title,
            id: id,
            platform: platform,
            state: state.toLowerCase(),
            link: link,
            endBlock: endBlock
        }
        compoundProposals.push(proposalJSON);
    }
    return compoundProposals;
}
