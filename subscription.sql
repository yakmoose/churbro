create table main.subscription
(
    id               integer not null
        constraint subscription_pk
            primary key autoincrement,
    endpoint         TEXT    not null,
    raw_subscription TEXT    not null
);

create index main.subscription_endpoint_index
    on main.subscription (endpoint);

