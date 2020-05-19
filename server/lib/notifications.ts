import { resolve } from 'url';

import { assert, makeLogger, translate as $t, KError, isAppriseApiEnabled } from '../helpers';

import Settings from '../models/entities/settings';

import fetch from 'node-fetch';

const log = makeLogger('notifications');

interface SendOptions {
    appriseUrl: string;
    subject: string;
    content: string;
}

class Notifier {
    appriseApiBaseUrl: string | null;

    constructor() {
        this.appriseApiBaseUrl =
            process.kresus.appriseApiBaseUrl !== null
                ? resolve(process.kresus.appriseApiBaseUrl, '/notify')
                : null;
    }

    _send(opts: SendOptions) {
        if (process.env.NODE_ENV !== 'production') {
            log.warn(`Notification: Subject: ${opts.subject}; Content: ${opts.content}`);
        }

        if (!isAppriseApiEnabled()) {
            log.warn("AppriseApiBaseUrl is missing: notifications won't work.");
            return;
        }
        assert(this.appriseApiBaseUrl !== null, 'enabled means apprise base url is set');

        const body = {
            urls: opts.appriseUrl,
            title: opts.subject,
            body: opts.content,
        };

        return fetch(this.appriseApiBaseUrl, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        }).then(res => {
            if (!res.ok) {
                throw new KError(
                    "Couldn't send notification with apprise",
                    res.status,
                    res.statusText
                );
            }
        });
    }

    async sendTestNotification(appriseUrl: string): Promise<void> {
        await this._send({
            appriseUrl,
            subject: $t('server.notification.test_notification.subject'),
            content: $t('server.notification.test_notification.content'),
        });
    }
}

let NOTIFIER: Notifier | null = null;
function _getBaseNotifier(): Notifier | null {
    if (NOTIFIER === null && isAppriseApiEnabled()) {
        NOTIFIER = new Notifier();
    }
    return NOTIFIER;
}

class UserNotifier {
    appriseUserUrl: string | null;
    userId: number;

    constructor(userId: number) {
        this.userId = userId;
        this.appriseUserUrl = null;
    }

    forceReinit(appriseUserUrl: string) {
        this.appriseUserUrl = appriseUserUrl;
    }

    async ensureInit() {
        if (this.appriseUserUrl) {
            return;
        }
        this.forceReinit((await Settings.findOrCreateDefault(this.userId, 'apprise-url')).value);
        log.info(`Apprise url fetched for user ${this.userId}`);
    }

    async send(subject: string, content: string) {
        await this.ensureInit();
        assert(this.appriseUserUrl !== null, 'appriseUserUrl should have been set by ensureInit');

        if (!subject) {
            return log.warn('Notifier.send misuse: subject is required');
        }
        if (!content) {
            return log.warn('Notifier.send misuse: content is required');
        }

        const notifier = _getBaseNotifier();
        if (notifier) {
            notifier._send({ subject, content, appriseUrl: this.appriseUserUrl });
        } else {
            assert(false, 'Notifier.send misuse: no notifier available');
        }
    }
}

const NOTIFIER_PER_USER_ID: { [k: string]: UserNotifier } = {};
function getNotifier(userId: number): UserNotifier | null {
    if (isAppriseApiEnabled() && !(userId in NOTIFIER_PER_USER_ID)) {
        log.info(`Notifier initialized for user ${userId}`);
        NOTIFIER_PER_USER_ID[userId] = new UserNotifier(userId);
    }
    return NOTIFIER_PER_USER_ID[userId] || null;
}

export async function sendTestNotification(appriseUrl: string): Promise<void> {
    const notifier = _getBaseNotifier();
    if (notifier) {
        await notifier.sendTestNotification(appriseUrl);
    }
}

export default getNotifier;
