A Non Technical Introduction to Bitcoin
===

Introduction
---

This is a brief overview of Bitcoin with minimal
math or algorithms, attempting to describe the underlying
high level concepts rather than get bogged down in
some of the technical details which might distract
from the core concepts.

Overview
---

The TLDR version of what will be discussed is as follows:

* Transactions are signed and timestamped so as not to be duplicated or forgeable 
* Transactions are broadcast to the group or network
* A representative is assigned by winning a "proof of work" lottery
* The representative creates an updated ledger page that includes:
  - As many transactions the representative wants onto the ledger, with some
    transactions giving a "tip" to the representative for including their transaction onto the ledger
  - An "incentive transaction" that assigns some pre-specified amount of money to the representative
    for winning the "proof of work" lottery
  - A summary, or "digest", of the previous ledger page to make sure the current ledger is in the
    correct position in history
  - A "proof of work" item that shows the representative actually did the work to win
    the "proof of work" lottery

For participants on the network:

* Listen for update to the ledger from representatives who've won the "proof of work" lottery
  - Reject any ledger updates that have invalid transactions like negative balances,
    invalid proof of work certificates, incorrect summaries, etc.
* Resolve competing ledger histories by choosing the longest valid ledger history


Creating A Ledger
---

Let's say we have three friends, `Alterpi`, `Berhap` and `Coleca`
that want to keep an account of their financial transactions
between themselves.
For example, they could all be going out to dinner and be willing
to settle up with their virtual ledger, perhaps to be paid in
cash at some later point.

For simplicity, let's say they each put $100 worth into this new
ledger of theirs.
Perhaps they put it in a lockbox somewhere to settle up at some
future time.

Let's make this the page "0" of the ledger that they create:

```
Page 0:
  2032-07-08 08:00:00am - Alterpi has $100
  2032-07-08 08:00:00am - Berhap has $100
  2032-07-08 08:00:00am - Coleca has $100
```

Now they can use that ledger to settle up transactions in the future.
For example, after a dinner out, their ledger could look something
like this:

```
Page 1:
  2032-07-09 09:05:31am - Alterpi owes Coleca $5
  2032-07-09 09:05:31am - Berhap owes Coleca $8
```

At the end of this, the Balance for each account would be:

* `Alterpi` - $95
* `Berhap` - $92
* `Coleca` - $113

So far, we have only created a *ledger*, an account
of all transactions and the current balance of how much
each person participating has.

Creating a Distributed Ledger
---

### Transaction Signatures

If some people in the group want to update the ledger independently
of the others, we want to
create a system that allows for each person to have
a copy of the ledger and to distribute changes to other people
that need it.

The first matter is to duplicate the ledger among all parties.
In our running example, that means `Alterpi`, `Berhap` and `Coleca`
now each have a copy of the ledger.

As a matter of keeping people honest, we will require a signature
on each transaction.
We will assume that a signature is near impossible to forge so
we can be confident that if we see a signature on a transaction,
it represents the actual intent of the party signing the transaction
to transfer those funds.

Note that the transaction is identified by time, page number, amount,
destination, source and signature, so copying a transaction line to
another page won't work.
You can think of the signature as including the identifying information
of where the transaction was located, so some malicious party can't
just transport the signature line to another section to try and get
a "double transfer" to occur.

For example, the above "Page 1" transaction history becomes:

```
Page 1:
  2032-07-09 09:05:31am - Alterpi owes Coleca $5 (signed by Alterpi on 2032-07-09 09:05:31am to give Coleca $5)
  2032-07-09 09:05:31am - Berhap owes Coleca $8 (signed by Berhap on 2032-07-09 09:05:31am to give Coleca $8)
```

### Advancing the Ledger Through Randomly Chosen Representatives

Now there is a question of how the ledger gets updated and how those changes are propagated to
the other people in the group.
Some people might disagree on which transactions to prioritize or include.
Others might disagree on who should have the privilege of updating the ledger.

To solve these problems, the group can effectively elect a single representative to collect transactions
on a ledger and then push the updated ledger to the group.

One possibility for groups of people that agree on this sort of democratic process is to hold
a randomized election procedure. One example of this process could be they write their name down on a piece of paper, throw it
into a hat. A name is then pulled out of the hat that temporarily elects a representative out who gets the privilege of collecting transactions
for just the one page of the ledger, updating it and pushing the changes to the group.

Problems come up when the network of people grow and not everyone knows who the other people in
the group are personally.
Someone could, in theory, pretend to be many people at once, putting their name multiple times,
unbeknownst to the other legitimate participants in the network.

To combat this type of attack, the group requires a "proof of work" lottery.
The technical details are described in the appendix but one analogy is that each participant
rolls a many-sided die.
Whoever gets a "1" first can announce to the network the ledger update they've assembled
along with a proof that they've rolled a "1" on their die.

To incentivize this work, whoever wins this lottery is allowed to give themselves some
predetermined amount of money, which they can write on the newly updated ledger they
are creating.
Additionally, transactions can have a "tip" to give to the representative as incentive
to include or prioritize their transaction.

When the group or network is small, the size of the die is small.
As the network grows, the die increases in size, making it harder for a "1" to be
rolled.

One assumption in this analogy is that the person rolling the die and announcing they rolled a
"1" can prove they actually rolled a "1" and aren't just lying.
We assume the work that went into rolling the die to roll the "1" is real and much
of the protocol is making sure there is a method by which people can't cheat at getting
and answer for these random rolls.

A more fundamental assumption is that this "proof of work" mechanism is a better proxy
for voting than some other method.
For example, the proof of work requires energy to be expended, offering no benefit to
someone pretending to be multiple accounts as each account would then need to expend energy.

Once a representative is elected, via this proof of work protocol, the representative
collects all the transactions they want and announces the updated ledger to the rest
of the people in the group.
The group listens for these updated ledger announcements, taking updates to the ledger
that have the longest valid ledger history.

One bad situation that might arise is when a representative who wins the proof of work
lottery decides to try and cheat.
Transactions are signed and timestamped, so duplicating transactions is not a possibility
but omitting transactions, perhaps a fund transfer from the representative to some other person
to try and skirt payment, might be done.

The proof of work lottery allows for a more egalitarian method of representatives to be
chosen, allowing updating the ledger to be decentralized.
The "longest valid ledger" policy makes sure the ledger updates in a timely manner but
also prevents malicious representatives from propagating bad behavior by allowing the
rest of the network's work to easily outpace a bad representative.

For a malicious or corrupt representative to keep up the fiction, they would need to
keep winning the lottery and pushing a version of the ledger that omits valid transactions.
Eventually, assuming the network is built up of at least half of people using it
legitimately, the corrupt representative will have to concede to a ledger that the
rest of the network decides is true if they want to keep being part of it.

### Ledger History and Ledger Summary

As a matter of diligence and correctness, the whole history of the ledger needs
to confirmed in each new ledger update.
If someone new were to come onto the network and receive a history of ledger updates
but with key pages missing, they would have an incorrect view of what balance
each person has.

One solution is to transmit every page of the ledger.
While this would work, this is costly as we're now transferring many pages
of documents that gets successively bigger on each advancement of the ledger.

To get around the growing size issue but still have a guarantee that the ledger
history is intact, a "summary" is created for each ledger page, in addition
to a place in the current ledger to indicate what the summary of the previous
ledger was.

The summary is assumed to be relatively small and of fixed size.
The summary is also assumed to be such that it's hard or near impossible
to forge.

As a cartoon example of a summary,
one can imagine taking 100 characters from the previous ledger, at some fixed position.
These 100 characters could be letters or numbers but otherwise are random, to a certain
extent.
The summary is only 100 characters, no matter how big the ledger page.
If some portion of those 100 characters depends on the summary of the previous ledger,
the new summary will depend on the previous ledger as well, just as the previous
ledger depends on the summary before it and the next ledger depends on the current
ledger summary.

Forging this summary is difficult as one would need to position the transactions to
be just right and hope the summaries have letters or numbers to aid in the deception.

This particular example is bad because there is a good possibility of being able
to forge these transactions, so it's only meant to be illustrative.
The technical details of this summary are in the appendix but the idea is the same
as the toy example but meant to guard against forgery by being secure.


### Overview

To recap:

* Transactions are signed and timestamped so as not to be duplicated or forgeable 
* Transactions are broadcast to the group
* A representative is assigned by winning a "proof of work" lottery
* The representative creates an updated ledger page that includes:
  - As many transactions the representative wants onto the ledger, with some
    transactions giving a "tip" to the representative for including their transaction onto the ledger
  - An "incentive transaction" that assigns some pre-specified amount of money to the representative
  - A summary, or "digest", of the previous ledger page to make sure the current ledger is in the
    correct position in history
  - A "proof of work" item that shows the representative actually did the work to win
    the "proof of work" lottery

For participants on the network:

* Listen for update to the ledger from representatives who've won the "proof of work" lottery
  - Reject any ledger updates that have invalid transactions like negative balances,
    invalid proof of work certificates, incorrect summaries, etc.
* Resolve competing ledger histories by choosing the longest valid ledger history

With this, we see where the term "blockchain" comes from.

Each ledger page is called a "block".
Each ledger page (or block) has a pointer to the summary of the previous ledger page,
creating a "chained" series of ledger pages, thus creating the blockchain.

References
---

* [Bitcoin.org Resources](https://bitcoin.org/en/resources)
* [3Blue1Brown - But how does bitcoin actually work? (YouTube)](https://www.youtube.com/watch?v=bBC-nXj3Ng4)

Appendix
---


