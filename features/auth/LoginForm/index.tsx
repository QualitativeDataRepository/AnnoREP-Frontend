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
        <h1 className="ar--form-title">Log in</h1>
        <p className="ar--form-desc">
          Give AnnoREP permissions to access your Dataverse resources and to write annotations to
          Hypothes.is server by providing your Application programming interface (<abbr>API</abbr>)
          tokens.
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
              <div>
                <Link
                  size="sm"
                  href={`${dataverseServerUrl}/loginpage.xhtml?redirectPage=%2Fdataverse.xhtml`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Log in
                </Link>{" "}
                to Dataverse and get your{" "}
                <Link
                  size="sm"
                  href={`${dataverseServerUrl}/dataverseuser.xhtml?selectTab=apiTokenTab`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  API token
                </Link>
              </div>
            }
            invalid={dataverseApiTokenIsInvalid}
            invalidText={dataverseApiTokenInvalidText}
            required={true}
            aria-required={true}
            placeholder="Enter your Dataverse API token"
            size="xl"
            type="text"
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
              <div>
                <Link
                  size="sm"
                  href="https://hypothes.is/login"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Log in
                </Link>{" "}
                to Hypothes.is and get your{" "}
                <Link
                  size="sm"
                  href="https://hypothes.is/account/developer"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  API token
                </Link>
              </div>
            }
            invalid={hypothesisApiTokenIsInvalid}
            invalidText={hypothesisApiTokenInvalidText}
            required={true}
            aria-required={true}
            placeholder="Enter your Hypothes.is API token"
            size="xl"
            type="text"
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
