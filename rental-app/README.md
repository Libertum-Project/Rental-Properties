# Rental properties contracts

This repo contains 3 main contracts:
- Bank
- FactoryProperty
- Property

## **Property**
This smart contract offers the ability to tokenize properties and split them into unlimited pieces upon collection creation, while allowing customization of the following parameters when creating the collection:
- **Type of investment:**
    1. Loans: Fixed rate and fixed time.
    2. Passive income: Fixed rate with no fixed time.
- **Total supply:** How many pieces can be sold
- **Value backup:** Envwise & Libertum maintain a dedicated backup of the total value for each property, ensuring financial security and stability for the investors
- **Property price:** Price of each piece at the initial property offering 
    NOTE: Property price * total supply CAN'T exceed the value backup.

## **Bank**
this smart contract establishes a direct connection between the Bank contract and the factoryProperty. Empowering users to claim their monthly yields,  As Envwise & Libertum creates new collections, the bank remains informed and efficiently distributes the yields to the investors associated with each property.

## **FactoryProperty**
This smart contract facilitates the creation of new collections exclusively by Envwise & Libertum, allowing them to launch new properties for users while maintaining control over the creation process (currently limited to Envwise & Libertum).

