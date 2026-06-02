var AUIGridLicense = "";
var lh = location.host;
if (lh == 'rentalplus.fursys.com') {
    AUIGridLicense = "eyJjdCI6IjJcL1pcLzN2dXNScGgwVUlRekJxZFFzeTd2dTQxXC9lVjdQMEVobUFRN1NZZFlUbHhBMXVKWkswTmRJZ1RcL1I4TFZuSkxKWDFIa3hVbmZoYUpid0FEWHZRbGdlaWl3N0orTUZOK1lRcCtrckdFZENQczlzSWZ2bFRjU3dRQVNjY3JOViIsIml2IjoiMDgyZmUwMDFkMTIzNDBmZDg2ZWNmYzllYWVlZWUxYWEiLCJzIjoiYjRjYjEzOGI2YjNmZGFjOSJ9";
} else if (lh == 'dev-rentalplus.fursys.com'){
  AUIGridLicense = "eyJjdCI6IjJcL1pcLzN2dXNScGgwVUlRekJxZFFzeTd2dTQxXC9lVjdQMEVobUFRN1NZZFlUbHhBMXVKWkswTmRJZ1RcL1I4TFZuSkxKWDFIa3hVbmZoYUpid0FEWHZRbGdlaWl3N0orTUZOK1lRcCtrckdFZENQczlzSWZ2bFRjU3dRQVNjY3JOViIsIml2IjoiMDgyZmUwMDFkMTIzNDBmZDg2ZWNmYzllYWVlZWUxYWEiLCJzIjoiYjRjYjEzOGI2YjNmZGFjOSJ9";
} else if (lh == 'localhost:9400') {
    AUIGridLicense = "eyJjdCI6IjJcL1pcLzN2dXNScGgwVUlRekJxZFFzeTd2dTQxXC9lVjdQMEVobUFRN1NZZFlUbHhBMXVKWkswTmRJZ1RcL1I4TFZuSkxKWDFIa3hVbmZoYUpid0FEWHZRbGdlaWl3N0orTUZOK1lRcCtrckdFZENQczlzSWZ2bFRjU3dRQVNjY3JOViIsIml2IjoiMDgyZmUwMDFkMTIzNDBmZDg2ZWNmYzllYWVlZWUxYWEiLCJzIjoiYjRjYjEzOGI2YjNmZGFjOSJ9";
}

if (typeof window !== "undefined") window.AUIGridLicense = AUIGridLicense;
