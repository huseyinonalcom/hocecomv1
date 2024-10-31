import { Address, Document, DocumentProduct, Establishment, User } from "payload/generated-types";
import { dateFormatOnlyDate } from "../formatters/dateformatters";
import { addDaysToDate } from "../addtodate";

export const documentToXml = (document: Document) => {
  const filename = `xml_${document.type}_${document.prefix ?? ""}${document.number}.xml`;

  const establishment = document.establishment as Establishment;
  const customer = document.customer as User;
  const docAddress = document.docAddress as Address;
  const documentProducts = document.documentProducts as DocumentProduct[];

  let taxRates = [];

  documentProducts.forEach((product) => {
    if (!taxRates.includes(product.tax)) {
      taxRates.push(product.tax);
    }
  });

  taxRates = taxRates.map((tax) => {
    const totalBeforeTax = documentProducts.reduce((acc, product) => {
      if (product.tax === tax) {
        return acc + product.subTotal / (1 + product.tax / 100);
      }
      return acc;
    }, 0);

    const totalTax = documentProducts.reduce((acc, product) => {
      if (product.tax === tax) {
        return acc + product.subTotal - product.subTotal / (1 + product.tax / 100);
      }
      return acc;
    }, 0);

    return {
      rate: tax,
      totalBeforeTax,
      totalTax,
    };
  });

  const totalTax = taxRates.reduce((acc, taxRate) => acc + taxRate.totalTax, 0);

  const total = documentProducts.reduce((acc, product) => acc + product.subTotal, 0);
  const totalBeforeTax = total - totalTax;

  const taxIDCleaned = establishment.taxID.replace("BE", "").replaceAll(".", "").trim();

  const content = `<?xml version="1.0" encoding="utf-8"?>
<Invoice xmlns:qdt="urn:oasis:names:specification:ubl:schema:xsd:QualifiedDatatypes-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:xades="http://uri.etsi.org/01903/v1.3.2#"
  xmlns:udt="urn:un:unece:uncefact:data:draft:UnqualifiedDataTypesSchemaModule:2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:ccts="urn:oasis:names:specification:ubl:schema:xsd:CoreComponentParameters-2"
  xmlns:stat="urn:oasis:names:specification:ubl:schema:xsd:DocumentStatusCode-1.0"
  xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
  xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
  xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#conformant#urn:UBL.BE:1.0.0.20180214</cbc:CustomizationID>
  <cbc:ProfileID>E-FFF.BE BILLIT.BE</cbc:ProfileID>
  <cbc:ID>${document.number}</cbc:ID>
  <cbc:CopyIndicator>false</cbc:CopyIndicator>
  <cbc:IssueDate>${dateFormatOnlyDate(document.date)}</cbc:IssueDate>
  <cbc:InvoiceTypeCode listURI="http://www.E-FFF.be/ubl/2.0/cl/gc/BE-InvoiceCode-1.0.gc">380</cbc:InvoiceTypeCode>
  <cbc:TaxPointDate>${dateFormatOnlyDate(document.date)}</cbc:TaxPointDate>
  <cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
  <cac:AdditionalDocumentReference>
    <cbc:ID>${filename}</cbc:ID>
    <cbc:DocumentType>CommercialInvoice</cbc:DocumentType>
  </cac:AdditionalDocumentReference>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cbc:EndpointID schemeID="BE:CBE">${taxIDCleaned}</cbc:EndpointID>
      <cac:PartyIdentification>
        <cbc:ID schemeAgencyID="BE" schemeAgencyName="KBO" schemeURI="http://www.e-fff.be/KBO">
          ${taxIDCleaned}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>BELANTRA</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>Bist</cbc:StreetName>
        <cbc:BuildingNumber>19</cbc:BuildingNumber>
        <cbc:CityName>Aartselaar</cbc:CityName>
        <cbc:PostalZone>2630</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>BE</cbc:IdentificationCode>
          <cbc:Name>België</cbc:Name>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${establishment.taxID.replaceAll(".", "").replaceAll(" ", "")}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>BELANTRA</cbc:RegistrationName>
        <cbc:CompanyID schemeID="BE:CBE">${taxIDCleaned}</cbc:CompanyID>
      </cac:PartyLegalEntity>
      <cac:Contact>
        <cbc:Name>Ayfema</cbc:Name>
        <cbc:ElectronicMail>info@ayfema.com</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${customer.firstName + " " + customer.lastName}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${docAddress.street}</cbc:StreetName>
        <cbc:BuildingNumber>${docAddress.door}</cbc:BuildingNumber>
        <cbc:CityName>${docAddress.city}</cbc:CityName>
        <cbc:PostalZone>${docAddress.zip}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${docAddress.country}</cbc:IdentificationCode>
          <cbc:Name>${docAddress.country}</cbc:Name>
        </cac:Country>
      </cac:PostalAddress>
      <cac:Contact>
        <cbc:Name>${customer.firstName + " " + customer.lastName}</cbc:Name>
        <cbc:ElectronicMail>${customer.email}</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode listID="UN/ECE 4461" listName="Payment Means"
      listURI="http://docs.oasis-open.org/ubl/os-UBL-2.0-update/cl/gc/default/PaymentMeansCode-2.0.gc">
      1</cbc:PaymentMeansCode>
    <cbc:PaymentDueDate>${dateFormatOnlyDate(addDaysToDate(document.date, 15).toString())}</cbc:PaymentDueDate>
    <cac:PayeeFinancialAccount>
      <cbc:ID schemeName="IBAN">BE07068937722366</cbc:ID>
      <cac:FinancialInstitutionBranch>
        <cac:FinancialInstitution>
          <cbc:ID schemeName="BIC">GKCCBEBB</cbc:ID>
        </cac:FinancialInstitution>
      </cac:FinancialInstitutionBranch>
    </cac:PayeeFinancialAccount>
  </cac:PaymentMeans>
  ${taxRates.map((taxRate) => {
    return `<cac:TaxTotal>
    <cbc:TaxAmount currencyID="EUR">${taxRate.totalTax.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="EUR">${taxRate.totalBeforeTax.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="EUR">${taxRate.totalTax.toFixed(2)}</cbc:TaxAmount>
      <cbc:Percent>${taxRate.rate}</cbc:Percent>
      <cac:TaxCategory>
        <cbc:ID schemeID="UNCL5305" schemeName="Duty or tax or fee category">S</cbc:ID>
        <cbc:Name>OSS-S</cbc:Name>
        <cbc:Percent>${taxRate.rate}</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
    </cac:TaxTotal>`;
  })}
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="EUR">${totalBeforeTax.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="EUR">${totalBeforeTax.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="EUR">${Number(total).toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="EUR">${Number(total).toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${documentProducts.map((docProd, i) => {
    let taxAmount = docProd.subTotal - docProd.subTotal / (1 + docProd.tax / 100);
    return `<cac:InvoiceLine>
    <cbc:ID>${i + 1}</cbc:ID>
    <cbc:Note>${docProd.name}</cbc:Note>
    <cbc:InvoicedQuantity>${docProd.amount}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="EUR">${(docProd.subTotal - taxAmount).toFixed(2)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="EUR">${taxAmount.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="EUR">${(docProd.subTotal - taxAmount).toFixed(2)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="EUR">${taxAmount.toFixed(2)}</cbc:TaxAmount>
        <cbc:Percent>${docProd.tax}</cbc:Percent>
        <cac:TaxCategory>
          <cbc:ID schemeID="UNCL5305" schemeName="Duty or tax or fee category">S</cbc:ID>
          <cbc:Name>OSS-S</cbc:Name>
          <cbc:Percent>${docProd.tax}</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Name>${docProd.name}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID schemeID="UNCL5305" schemeName="Duty or tax or fee category">S</cbc:ID>
        <cbc:Name>OSS-S</cbc:Name>
        <cbc:Percent>${docProd.tax}</cbc:Percent>        
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
  </cac:InvoiceLine>`;
  })}
</Invoice>`;

  return {
    content,
    filename,
  };
};
