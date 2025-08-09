function uniqueIdentifier() {
    return Math.random().toString(32).substr(2, 5);
}

export default function synchronized(key, store, filter = (s) => s) {
    const id = uniqueIdentifier();
    let version = uniqueIdentifier();

    function onSync(e) {
        if (e.detail.id === id || e.detail.version === version) {
            return;
        }

        version = e.detail.version;

        store.update((state) => ({
            ...state,
            ...filter(e.detail.state)
        }), true);
    }

    window.addEventListener(`store:sync:${key}`, onSync);

    return {
        ...store,

        update(handler, skipSync) {
            store.update((state) => {
                const nextState = handler(state);

                if (skipSync !== true) {
                    version = uniqueIdentifier();

                    const event = new CustomEvent(`store:sync:${key}`, {
                        detail: {
                            state: nextState,
                            id,
                            version
                        }
                    });

                    setTimeout(() => {
                        window.dispatchEvent(event);
                    }, 0);
                }

                return nextState;
            });
        }
    };
}