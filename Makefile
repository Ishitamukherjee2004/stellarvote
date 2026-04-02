.PHONY: all build test deploy bindings clean

all: build

build:
	stellar contract build

test:
	cargo test

deploy: build
	stellar contract deploy --wasm target/wasm32-unknown-unknown/release/voting_contract.wasm --source-account MyIdentity --network testnet

bindings:
	stellar contract bindings typescript --wasm target/wasm32-unknown-unknown/release/voting_contract.wasm --output-dir frontend/src/contracts/voting --overwrite

clean:
	cargo clean
	rm -rf target/
