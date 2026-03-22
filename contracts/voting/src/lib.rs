#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec};

mod test;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Poll {
    pub id: u64,
    pub question: String,
    pub options: Vec<String>,
    pub is_active: bool,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq)]
pub enum DataKey {
    PollCount,                 // u64
    Poll(u64),                 // Poll object
    VoteCount(u64, u32),       // (poll_id, option_index) -> u32
    UserVoted(u64, Address),   // (poll_id, User Address) -> bool
}

#[contract]
pub struct VotingContract;

#[contractimpl]
impl VotingContract {
    /// Create a new poll. Returns the poll_id.
    pub fn create_poll(env: Env, question: String, options: Vec<String>) -> u64 {
        let poll_id = env.storage().instance().get(&DataKey::PollCount).unwrap_or(0);
        
        // Ensure at least 2 options
        if options.len() < 2 {
            panic!("A poll must have at least 2 options");
        }

        let poll = Poll {
            id: poll_id,
            question,
            options: options.clone(),
            is_active: true,
        };

        // Initialize vote counts to 0
        for i in 0..options.len() {
            env.storage().instance().set(&DataKey::VoteCount(poll_id, i), &0u32);
        }

        env.storage().instance().set(&DataKey::Poll(poll_id), &poll);
        env.storage().instance().set(&DataKey::PollCount, &(poll_id + 1));

        poll_id
    }

    /// Cast a vote for a given poll and option
    pub fn vote(env: Env, voter: Address, poll_id: u64, option_index: u32) {
        voter.require_auth();

        let poll: Poll = env.storage().instance().get(&DataKey::Poll(poll_id)).unwrap_or_else(|| panic!("Poll does not exist"));

        if !poll.is_active {
            panic!("Poll is not active");
        }

        if option_index >= poll.options.len() {
            panic!("Invalid option index");
        }

        let has_voted_key = DataKey::UserVoted(poll_id, voter.clone());
        if env.storage().instance().has(&has_voted_key) {
            panic!("User already voted in this poll");
        }

        // Record the vote
        env.storage().instance().set(&has_voted_key, &true);

        // Increment vote count
        let vote_count_key = DataKey::VoteCount(poll_id, option_index);
        let current_votes: u32 = env.storage().instance().get(&vote_count_key).unwrap_or(0);
        env.storage().instance().set(&vote_count_key, &(current_votes + 1));
    }

    /// Get poll details
    pub fn get_poll(env: Env, poll_id: u64) -> Poll {
        env.storage().instance().get(&DataKey::Poll(poll_id)).unwrap_or_else(|| panic!("Poll does not exist"))
    }

    /// Get total vote counts for a poll. Returns a Vec of counts matching the options order.
    pub fn get_results(env: Env, poll_id: u64) -> Vec<u32> {
        let poll: Poll = env.storage().instance().get(&DataKey::Poll(poll_id)).unwrap_or_else(|| panic!("Poll does not exist"));
        
        let mut results = Vec::new(&env);
        for i in 0..poll.options.len() {
            let count: u32 = env.storage().instance().get(&DataKey::VoteCount(poll_id, i)).unwrap_or(0);
            results.push_back(count);
        }
        
        results
    }
}
