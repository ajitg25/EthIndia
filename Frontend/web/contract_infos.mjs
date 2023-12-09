const addition_contract_address = '0x656526f7818A359164a0E1FbDd5548E43E00408F';
const addition_contract_abi = (
`[
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "req_id",
				"type": "uint256"
			}
		],
		"name": "grantRequest",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_patient",
				"type": "address"
			},
			{
				"internalType": "bytes16",
				"name": "_blob_id",
				"type": "bytes16"
			},
			{
				"internalType": "bytes16",
				"name": "_blob_checksum",
				"type": "bytes16"
			}
		],
		"name": "Request",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "patient",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "hospital",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bytes16",
				"name": "blob_id",
				"type": "bytes16"
			},
			{
				"indexed": false,
				"internalType": "bytes16",
				"name": "blob_checksum",
				"type": "bytes16"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "req_id",
				"type": "uint256"
			}
		],
		"name": "RequestAddition",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes16",
				"name": "blob_id",
				"type": "bytes16"
			}
		],
		"name": "RequestGranted",
		"type": "event"
	}
]`
);

const view_contract_address = '0x3b277a5079eB2408481b10Ec570f75Ab695F7981';
const view_contract_abi = (
`[
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "patient",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "hospital",
				"type": "address"
			}
		],
		"name": "RequestGranted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "patient",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "hospital",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "req_id",
				"type": "uint256"
			}
		],
		"name": "RequestView",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_patient",
				"type": "address"
			}
		],
		"name": "Request",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "req_id",
				"type": "uint256"
			}
		],
		"name": "grantRequest",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]`
);

export const contract_addresses = {
  addition_contract: addition_contract_address,
  view_contract: view_contract_address
}

export const contract_abis = {
  addition_contract: addition_contract_abi,
  view_contract: view_contract_abi
}