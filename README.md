# Gomoku
My friend walks around with a gomoku board. The js online multiplayer  alternative. Play at [theninthbit](http://theninthbit.us/gomoku)

## This is
 - connect five with Go pieces and board
 - continuation to the [tictac](https://github.com/safetyscissors/tic-tac) game engine and animation queue
 - multiplayer originally based on ajax comet, then migrated to websockets 

## Why this one
 - there are few online versions of connect 5/gomoku.
 - this allows 2 people to play on the same device
 - this version allows people to start a game in the morning and add moves throughout the day instead of just live or per session.
 - piece placement is randomly misaligned :P

## Pieces
 - php login/sessions
 - client:js websockets -> pusher -> server:php (wish i was running node alongside lamp on my server)
 - sms notification through email -> phonenumber@carrierextension.net
 - mysql db
