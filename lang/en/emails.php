<?php

declare(strict_types=1);

return [
    'receipt' => [
        'subject' => 'Your :brand swap receipt',
        'heading' => 'Your swap is complete',
        'greeting' => 'Thanks for swapping with :brand. Here are the details of your completed exchange.',
        'pair' => 'Pair',
        'sent' => 'You sent',
        'received' => 'You received',
        'transaction_id' => 'Transaction ID',
        'completed_at' => 'Completed',
        'view_button' => 'View transaction',
        'support_note' => 'If you have any questions reach out to us at',
        'support_link' => 'support',
        'thanks' => 'Thanks again,',
    ],

    'admin_failure' => [
        'subject' => '[:brand] Transaction :status — :id',
        'heading' => 'Transaction :status requires attention',
        'intro' => 'An exchange on :brand needs operator review.',
        'transaction_id' => 'Transaction ID',
        'status' => 'Status',
        'pair' => 'Pair',
        'amount_sent' => 'Amount sent',
        'amount_received' => 'Amount received',
        'created_at' => 'Created',
        'flagged_stuck' => 'Flagged stuck',
        'open_button' => 'Open in admin',
        'footer' => 'Operations alert from',
        'failed' => 'failed',
        'stuck' => 'stuck',
        'yes' => 'Yes',
        'no' => 'No',
    ],

    'ticket_opened' => [
        'subject' => '[:brand] :ticket_id — your support request is open',
        'heading' => 'We received your message',
        'intro' => 'Hi! Thanks for reaching out to :brand. Your support request is now in our queue and a human will reply within hours.',
        'subject_lbl' => 'Subject',
        'reference' => 'Reference',
        'view_button' => 'View and reply',
        'tip_lbl' => 'Tip',
        'tip' => 'Reply to any of our emails or use the link above to add new information to your ticket.',
        'footer' => 'Thanks for using',
    ],

    'reset' => [
        'heading' => 'Reset your password',
        'intro' => 'We received a request to reset the password for your :brand account.',
        'button' => 'Reset password',
        'expire_note' => 'This link expires in :minutes minutes.',
        'ignore_note' => 'If you did not request a reset, you can safely ignore this email.',
        'support_note' => 'Need help? Reach out at',
        'support_link' => 'support',
        'thanks' => 'Thanks,',
    ],

    'ticket_replied' => [
        'subject' => '[:brand] :ticket_id — we replied to your ticket',
        'heading' => 'You have a new reply',
        'intro' => 'Our team replied to your support request. Read it and respond from your private ticket link below.',
        'reply_from' => 'Reply from :name',
        'view_button' => 'Open ticket',
        'footer' => 'Sent from',
    ],

    'limit_filled' => [
        'subject' => '[:brand] Limit order filled — :pair',
        'heading' => 'Your limit order has fired',
        'intro' => 'Your :brand limit order on :pair just hit its target and a swap has been started.',
        'pair' => 'Pair',
        'target' => 'Target rate',
        'executed_rate' => 'Executed rate',
        'received' => 'Amount received',
        'transaction_id' => 'Transaction ID',
        'view_button' => 'View transaction',
        'footer' => 'Sent from :brand.',
    ],

    'limit_expired' => [
        'subject' => '[:brand] Limit order expired — :pair',
        'heading' => 'Your limit order expired',
        'intro' => 'Your :brand limit order on :pair reached its expiration without filling.',
        'pair' => 'Pair',
        'amount' => 'Amount',
        'target' => 'Target rate',
        'cta' => 'Create a new limit order',
        'footer' => 'Sent from :brand.',
    ],

    'recurring_run' => [
        'subject' => '[:brand] Recurring swap — :pair',
        'heading' => 'Your recurring swap has run',
        'intro' => 'Your :brand recurring swap on :pair has executed.',
        'pair' => 'Pair',
        'amount' => 'Amount sent',
        'received' => 'Amount received',
        'frequency' => 'Frequency',
        'runs_completed' => 'Runs completed',
        'next_run' => 'Next run',
        'view_button' => 'View transaction',
        'skip_next' => 'Skip the next run',
        'footer' => 'Sent from :brand.',
    ],

    'campaign' => [
        'unsubscribe_intro' => 'Want to stop receiving these messages?',
        'unsubscribe_link' => 'Unsubscribe',
        'footer' => 'Sent with care from',
    ],
];
