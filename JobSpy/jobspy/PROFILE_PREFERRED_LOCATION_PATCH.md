# Preferred Location Profile Patch

The job-search backend already reads `user.preferredLocation` and the Python matcher already accepts `preferredLocation` as the profile location field. The remaining work is in the profile model and CareerProfile UI, whose exact current source was not available in the supplied files.

## 1. server/models/User.js

Inside `userSchema`, add this field if it is not already present:

```js
preferredLocation: {
  type: String,
  default: "",
  trim: true,
},
```

Keep the existing `preferredWorkMode`, `preferredIndustry`, `expectedSalary`, and other profile fields unchanged.

## 2. Profile update controller

Where the profile update controller builds the update object, include:

```js
preferredLocation:
  typeof req.body.preferredLocation === "string"
    ? req.body.preferredLocation.trim()
    : "",
```

If the controller copies a list of allowed profile fields, add `preferredLocation` to that list.

## 3. Profile GET response

Include:

```js
preferredLocation: user.preferredLocation || "",
```

## 4. client/src/pages/CareerProfile/CareerProfile.jsx

Add state:

```jsx
const [preferredLocation, setPreferredLocation] = useState("");
```

When loading the profile:

```jsx
setPreferredLocation(data.preferredLocation || "");
```

When saving the profile, include:

```js
preferredLocation: preferredLocation.trim(),
```

Add the input beside the other job-preference fields:

```jsx
<div className="form-group">
  <label>Preferred Location</label>
  <input
    type="text"
    value={preferredLocation}
    onChange={(event) => setPreferredLocation(event.target.value)}
    placeholder="City, state, country, or region"
  />
</div>
```

## 5. Important behavior

Do not automatically copy the Dashboard search location into this field. It is a persistent profile preference.

Remote jobs should remain globally eligible even when a preferred location is stored. For non-remote jobs, the matching layer uses this preference when it is available.
