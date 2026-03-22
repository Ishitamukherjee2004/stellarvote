.PHONY: all build test deploy bindings clean

all: build

build:
	cargo build --target wasm32-unknown-unknown --release

test:
	cargo test

deploy: build
	soroban contract deploy --wasm target/wasm32-unknown-unknown/release/voting.wasm --source-account $$(soroban config identity address MyIdentity) --network testnet

bindings:
	soroban contract bindings typescript --wasm target/wasm32-unknown-unknown/release/voting.wasm --output-dir frontend/src/contracts/voting --overwrite

clean:
	cargo clean
	rm -rf target/
