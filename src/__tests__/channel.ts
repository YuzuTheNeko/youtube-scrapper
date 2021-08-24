import { getChannel } from "../functions/getChannel";

getChannel("UCyS2WiAzTOM_HzgGxOTcYhQ")
.then(channel => {
    console.log(
        channel.get("availableCountryCodes")
    )
})