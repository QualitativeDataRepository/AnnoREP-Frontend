import React, { ChangeEvent, FC, FormEventHandler } from "react"

import { Button, Form, TextInput, Link } from "carbon-components-react"

export interface LoginFormProps {
  /**The dataverse server url */
  dataverseServerUrl: string
  /**The dataverse api token */
  dataverseApiToken: string
  /**Is the dataverse api token valid? */
  dataverseApiTokenIsInvalid: boolean
  /**The error mesage for the dataverse api token input */
  dataverseApiTokenInvalidText: string
  /**Callback to handle the dataverse api token input changes */
  handleDataverseApiTokenChange(value: string): void
  /**The hypothesis api token */
  hypothesisApiToken: string
  /**Is the hypothesis api token valid? */
  hypothesisApiTokenIsInvalid: boolean
  /**The error message for the hypothesis api token input */
  hypothesisApiTokenInvalidText: string
  /**Callback to handle the hypothesis api token input changes */
  handleHypothesisApiTokenChange(value: string): void
  /**Callback to handle login */
  handleLogin(): void
}

/** Login Form */
const LoginForm: FC<LoginFormProps> = ({
  dataverseServerUrl,
  dataverseApiToken,
  dataverseApiTokenIsInvalid,
  dataverseApiTokenInvalidText,
  hypothesisApiToken,
  hypothesisApiTokenIsInvalid,
  hypothesisApiTokenInvalidText,
  handleDataverseApiTokenChange,
  handleHypothesisApiTokenChange,
  handleLogin,
}: LoginFormProps) => {
  const onDataverseApiTokenChange = (event: ChangeEvent<HTMLInputElement>) =>
    handleDataverseApiTokenChange(event.target.value)
  const onHypothesisApiTokenChange = (event: ChangeEvent<HTMLInputElement>) =>
    handleHypothesisApiTokenChange(event.target.value)
  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    handleLogin()
  }

  return (
    <main className="ar--form-container">
      <Form onSubmit={onSubmit}>
        <h1 className="ar--form-title">Log in to a Dataverse</h1>
        <p className="ar--form-desc">
          Give AnnoREP permissions to access your Dataverse resources by providing your Application
          programming interface (<abbr>API</abbr>) token. Instructions for getting an{" "}
          <abbr>API</abbr> token are described in the{" "}
          <Link
            size="lg"
            href="https://guides.dataverse.org/en/latest/user/account.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Account Creation + Management
          </Link>{" "}
          section of the User Guide.
        </p>
        <div className="ar--form-item">
          <TextInput
            id="dataverse-api-token"
            labelText={
              <div>
                Dataverse <abbr>API</abbr> token
              </div>
            }
            helperText={
              <Link
                href={`${dataverseServerUrl}/dataverseuser?xhtml?selectTab=apiTokenTab`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get your Dataverse API token
              </Link>
            }
            invalid={dataverseApiTokenIsInvalid}
            invalidText={dataverseApiTokenInvalidText}
            required={true}
            aria-required={true}
            placeholder="Enter your Dataverse API token"
            size="xl"
            type="password"
            value={dataverseApiToken}
            onChange={onDataverseApiTokenChange}
          />
        </div>
        <div className="ar--form-item">
          <TextInput
            id="hypothesis-api-token"
            labelText={
              <div>
                Hypothes.is <abbr>API</abbr> token
              </div>
            }
            helperText={
              <Link
                href="https://hypothes.is/account/developer"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get your Hypothes.is API token
              </Link>
            }
            invalid={hypothesisApiTokenIsInvalid}
            invalidText={hypothesisApiTokenInvalidText}
            required={true}
            aria-required={true}
            placeholder="Enter your Hypothes.is API token"
            size="xl"
            type="password"
            value={hypothesisApiToken}
            onChange={onHypothesisApiTokenChange}
          />
        </div>
        <Button className="ar--form-submit-btn" type="submit">
          Log in
        </Button>
      </Form>
    </main>
  )
}

export default LoginForm
