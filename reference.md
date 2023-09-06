# Victor's server API reference
[API REF](https://docs.google.com/document/d/1d9G2GFeD81KRl4OOemSvCYWyi7ejozZ6kKSfMCHzj4M/edit?usp=sharing)


# Reference for the mail API

```
 EMAIL,FIRSTNAME,PHONE,CREATION_DATE,GENDER
 junie@example.com,Junie,0682145672,2019-01-15,1
 john@example.com,John,0745632109,2019-03-10,2
 marc@example.com,Marc,0675489125,2019-08-22,1
 ```

The header line is optional.
Separators are mandatory and can be either: a comma, a semicolon or a tabulation.
Each type of data must be correctly formatted as an email address, text, number or category.
Category data columns should contain only the category option ID number (ex: 1, 2, 3...)


# Reference for Create User
trial                       # First line, always just the string "trial". This isn't used
Victor Lesk                 # Second line, the name of the account holder
victorlesk@hotmail.com      # Third line, the email of the account holder
+12323                      # Fourth line, the phone of the account holder, or blank
victorBC1                   # Fifth line, the proposed "game code"/slot name/account name. This must be alphanumeric and especially not include space or newline characters
Wales                       # Sixth line, the country (England, Scotland, Wales, NI are separate countries)
bexsilver                   # Seventh line, the type of bex account that is being signed up for bexbronze/bexsilver/bexgold - one of those three strings exactly


# testing account




# XML Parser
```
const xml2js = require('xml2js');

const xmlResponse = `
<hranxrefreshresponse sf="s">
 <handanxs>
  <handanx n="1"><![CDATA[1 7 7 3 5 4 7 7 3 5 4 5 6 9 7 9 5 6 9 7 8]]></handanx>
  <handanx n="2"><![CDATA[2 10 8 8 10 10 10 8 9 10 10 3 4 4 2 3 3 5 4 2 3]]></handanx>
  <handanx n="3"><![CDATA[3 3 3 12 10 6 3 3 12 10 6 9 10 1 3 4 10 10 1 3 4]]></handanx>
  <handanx n="4"><![CDATA[4 9 8 5 4 4 9 8 5 4 4 4 5 7 8 8 4 5 7 8 8]]></handanx>
  <handanx n="5"><![CDATA[5 10 7 6 8 9 10 7 6 8 9 3 6 7 4 4 3 6 7 4 4]]></handanx>
  <handanx n="6"><![CDATA[6 5 11 4 10 8 5 11 4 10 8 8 2 8 2 2 8 2 8 2 2]]></handanx>
  <handanx n="7"><![CDATA[7 10 10 8 8 10 10 10 8 7 10 3 2 4 5 3 3 3 5 5 3]]></handanx>
  <handanx n="8"><![CDATA[8 8 5 6 9 4 8 5 6 9 4 5 8 6 3 6 5 8 6 3 6]]></handanx>
 </handanxs>
</hranxrefreshresponse>
`;

// Parse the XML response
xml2js.parseString(xmlResponse, (err, result) => {
  if (err) {
    console.error(err);
    return;
  }

  // Access the sf attribute
  const sfAttribute = result.hranxrefreshresponse.$.sf;
  console.log(sfAttribute);
});

```