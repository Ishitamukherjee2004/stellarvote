#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String, Vec};

#[test]
fn test_voting_flow() {
    let env = Env::default();
    env.mock_all_auths(); // Allow all require_auth calls to succeed in testing

    let contract_id = env.register_contract(None, VotingContract);
    let client = VotingContractClient::new(&env, &contract_id);

    // Create poll
    let question = String::from_str(&env, "What is your favorite color?");
    let mut options = Vec::new(&env);
    options.push_back(String::from_str(&env, "Red"));
    options.push_back(String::from_str(&env, "Blue"));
    options.push_back(String::from_str(&env, "Green"));

    let poll_id = client.create_poll(&question, &options);
    assert_eq!(poll_id, 0);

    // Verify poll details
    let poll = client.get_poll(&poll_id);
    assert_eq!(poll.question, question);
    assert_eq!(poll.options.len(), 3);
    assert_eq!(poll.is_active, true);

    // Vote
    let voter1 = Address::generate(&env);
    client.vote(&voter1, &poll_id, &1); // Vote for Blue

    let voter2 = Address::generate(&env);
    client.vote(&voter2, &poll_id, &1); // Vote for Blue

    let voter3 = Address::generate(&env);
    client.vote(&voter3, &poll_id, &2); // Vote for Green

    // Get results
    let results = client.get_results(&poll_id);
    assert_eq!(results.len(), 3);
    assert_eq!(results.get(0).unwrap(), 0);
    assert_eq!(results.get(1).unwrap(), 2);
    assert_eq!(results.get(2).unwrap(), 1);
}

#[test]
#[should_panic(expected = "User already voted in this poll")]
fn test_double_voting() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, VotingContract);
    let client = VotingContractClient::new(&env, &contract_id);

    let question = String::from_str(&env, "Yes or No?");
    let mut options = Vec::new(&env);
    options.push_back(String::from_str(&env, "Yes"));
    options.push_back(String::from_str(&env, "No"));

    let poll_id = client.create_poll(&question, &options);

    let voter = Address::generate(&env);
    client.vote(&voter, &poll_id, &0);
    
    // This should panic
    client.vote(&voter, &poll_id, &1);
}

#[test]
#[should_panic(expected = "Invalid option index")]
fn test_invalid_option() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, VotingContract);
    let client = VotingContractClient::new(&env, &contract_id);

    let question = String::from_str(&env, "Yes or No?");
    let mut options = Vec::new(&env);
    options.push_back(String::from_str(&env, "Yes"));
    options.push_back(String::from_str(&env, "No"));

    let poll_id = client.create_poll(&question, &options);

    let voter = Address::generate(&env);
    // There are only 2 options (indexes 0 and 1)
    client.vote(&voter, &poll_id, &2);
}
