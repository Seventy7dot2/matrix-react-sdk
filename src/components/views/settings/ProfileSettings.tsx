/*
Copyright 2019 - 2024 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React, { ChangeEvent, useCallback, useState } from "react";
import { logger } from "matrix-js-sdk/src/logger";
import { EditInPlace } from "@vector-im/compound-web";

import { _t } from "../../../languageHandler";
import { MatrixClientPeg } from "../../../MatrixClientPeg";
import { OwnProfileStore } from "../../../stores/OwnProfileStore";
import AvatarSetting from "./AvatarSetting";
import PosthogTrackers from "../../../PosthogTrackers";

const ProfileSettings: React.FC = () => {
    const [avatarURL, setAvatarURL] = useState(OwnProfileStore.instance.avatarMxc);
    const [displayName, setDisplayName] = useState(OwnProfileStore.instance.displayName ?? "");
    const [initialDisplayName, setInitialDisplayName] = useState(OwnProfileStore.instance.displayName ?? "");

    const onAvatarRemove = useCallback(async () => {
        // xxx show progress
        await MatrixClientPeg.safeGet().setAvatarUrl(""); // use empty string as Synapse 500s on undefined
        setAvatarURL("");
    }, []);

    const onAvatarChange = useCallback(async (avatarFile: File) => {
        PosthogTrackers.trackInteraction("WebProfileSettingsAvatarUploadButton");
        logger.log(`Uploading new avatar, ${avatarFile.name} of type ${avatarFile.type}, (${avatarFile.size}) bytes`);
        // xxx show progress
        const client = MatrixClientPeg.safeGet();
        const { content_uri: uri } = await client.uploadContent(avatarFile);
        await client.setAvatarUrl(uri);
        setAvatarURL(uri);
    }, []);

    const onDisplayNameChanged = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setDisplayName(e.target.value);
    }, []);

    const onDisplayNameCancel = useCallback(() => {
        setDisplayName(OwnProfileStore.instance.displayName ?? "");
    }, []);

    const onDisplayNameSave = useCallback(async (): Promise<void> => {
        await MatrixClientPeg.safeGet().setDisplayName(displayName);
        setInitialDisplayName(displayName);
        return Promise.resolve();
    }, [displayName]);

    return (
        <div className="mx_ProfileSettings">
            <h2>{_t("common|profile")}</h2>
            <div>{_t("settings|general|profile_subtitle")}</div>
            <div className="mx_ProfileSettings_profile">
                <AvatarSetting
                    avatar={avatarURL ?? undefined}
                    avatarAltText={_t("common|user_avatar")}
                    onChange={onAvatarChange}
                    removeAvatar={onAvatarRemove}
                />
                <EditInPlace
                    className="mx_ProfileSettings_profile_displayName"
                    label={_t("settings|general|display_name")}
                    value={displayName}
                    initialValue={initialDisplayName}
                    onChange={onDisplayNameChanged}
                    onCancel={onDisplayNameCancel}
                    onSave={onDisplayNameSave}
                />
            </div>
        </div>
    );
};

export default ProfileSettings;
